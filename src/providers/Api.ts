import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Push, Transfer} from 'ionic-native';
import {Http, Headers} from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

@Injectable()
export class Api {
    username:string;
    password:string;
    token:string;
    // url:string = 'http://newton.eycproveedores.com/newton/public/';
    url:string = 'http://localhost/newton/public/';
    user:any={token: null};
    pushData:any;
    carrito = [];
    vista='grid';
    categorias = [44,27,46,47,48,49,26,45,50,51,52,53];
    // categorias = [44,27];
    index = 0;
    constructor(public http: Http, private platform:Platform, public storage:Storage){
        this.initVar();
    }

    initVar(){
        this.storage.get("username").then( (data)  => data != undefined ? this.username = data : '' );
        this.storage.get("password").then( (data)  =>  data != undefined ? this.password = data : '' );
        this.storage.get("user").then( (data)      =>  data!=undefined ? this.user = JSON.parse(data): {} );
        // this.storage.get("carrito").then( (data)      =>  data!=undefined ? this.carrito = JSON.parse(data): [] );
    }

    saveData () {
        this.storage.set("username", this.username);
        this.storage.set("password", this.password);
        this.storage.set("url", this.url);
    };

    saveUser(user){
        this.storage.set("user",JSON.stringify(user));
    }

    doLogin(){
        return new Promise((resolve,reject) => {
            this.http.get(this.url + "api/login", {headers : this.setHeaders()})
            .map(res => res.json() )
            .subscribe(data => {
                resolve(data);
            }, error => {
                return reject(this.handleData(error));
            });
        });
    }

    get(uri){
        return new Promise((resolve,reject) => {
            this.http.get(this.url + "api/" + uri, {headers : this.setHeaders()})
            .map(res => res.json() )
            .subscribe(data => {
                resolve(data);
            }, error => {
                return reject(this.handleData(error));
            });
        });
    }

    post(uri,data){
        return new Promise((resolve,reject) => {
            this.http.post(this.url + "api/" + uri,data ,{headers : this.setHeaders()})
            .map(res => res.json() )
            .subscribe(data => {
                resolve(data);
            }, error => {
                return reject(this.handleData(error));
            });
        });
    }

    addToCart(producto){
        var index = this.carrito.findIndex((item)=>{
            return item.id == producto.id;
        });
        if(index == -1){
            this.carrito.push(producto);
        }else{
            this.carrito[index].cantidad_pedidos = producto.cantidad_pedidos;
        }
        this.storage.set("carrito",JSON.stringify(this.carrito));
    }

    removeFromCart(producto){
        var index = this.carrito.findIndex((item)=>{
            return item.id == producto.id;
        });
        if(index == -1){
            return false;
        }else{
            this.carrito.splice(index);
            this.storage.set("carrito",JSON.stringify(this.carrito));
            return true;
        }
    }

    clearCarrito(){
        return new Promise((resolve,reject)=>{
            this.carrito = [];
            this.storage.set("carrito",JSON.stringify(this.carrito));
            resolve(true);
        })
    }

    postPushtoken(data){
          return new Promise((resolve,reject) => {
              this.http.post(this.url + "api/dispositivos", data ,{headers : this.setHeaders()})
              .map(res => res.json())
              .subscribe(data => {
                  resolve(data);
              }, error => {return reject(this.handleData(error))});
          });
      }

    pushRegister(){
        let push:any = Push.init({
            android: {
                senderID: "600000041642",
                clearNotifications: 'false',
            },
            ios: {
                alert: "true",
                badge: true,
                sound: 'true'
            },
            windows: {}
        });

        if (typeof push.error === 'undefined' || push.error === null){
            let body;
            push.on('registration', (data) => {
                console.log(data.registrationId);
                if(this.platform.is('android'))
                     body = "token=" + data.registrationId + "&plataforma=android";
                else
                    body = "token=" + data.registrationId + "&plataforma=ios";

                this.postPushtoken(body).then(Response =>{
                    this.pushData = Response;
                    this.savePushData(Response);
                });
            });

            push.on('notification', (data) => {
                console.log(data.message);
                console.log(data.title);
                console.log(data.count);
                console.log(data.sound);
                console.log(data.image);
                console.log(data.additionalData);
            });

            push.on('error', (e) => {
                console.log(e.message);
            });
            return true;
        }
        return false;
    }

    savePushData(pushData){
        this.storage.set('pushData',JSON.stringify(pushData));
    }

    putPushData(id, data){
        return new Promise((resolve,reject) => {
            this.http.put(this.url + "api/dispositivos/" + id, data ,{headers : this.setHeaders()})
            .map(res => res.json())
            .subscribe(data => {
                resolve(data);
            }, error => {return reject(this.handleData(error))});
        });
    }

    private setHeaders(){
        let headers = new Headers();
        headers.append("Authorization","Basic " + btoa(this.username + ":" + this.password));
        return headers;
    }

    private handleData(res){
        if(res.statusText == "Ok"){
            return {status: "No Parace haber conexión con el servidor"};
        }

        // If request fails, throw an Error that will be caught
        if(res.status < 200 || res.status >= 300) {
            return {error: res.status}
        }
        // If everything went fine, return the response
        else {
            return res;
        }
    }
}
