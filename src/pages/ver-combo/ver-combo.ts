import { Component } from '@angular/core';
import {AlertController, ToastController,  LoadingController,   NavController,    NavParams} from 'ionic-angular';
import  {Api} from '../../providers/Api';
@Component({
  selector: 'page-ver-combo',
  templateUrl: 'ver-combo.html'
})
export class VerComboPage {
    combo: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api:Api, public loading:LoadingController, public toast:ToastController, public alert:AlertController) {
      this.combo = navParams.get('combo');
  }

  processCarrito(){
        var data:any = {combos:[]};
        data.user_id = this.api.user.id;
        data.cliente_id = this.api.user.cliente_id;
        data.fecha_envio = (new Date()).toISOString().substring(0,10);
        data.fecha_entrega = (new Date()).toISOString().substring(0,10);
        data.estado = "Pedido";
        data.combos = [this.combo];
        console.log(data);
        var loading = this.loading.create({content:`
            <div class="loader">
                <img src="${this.api.url + "img/logo.png"}"/>
            </div>
            Procesando Pedido`,
            spinner:'hide'})
        loading.present();
        this.api.post("pedidos",data)
        .then((data)=>{
            loading.dismiss().then(()=>{
                this.toast.create({message:"Pedido Procesado",duration:3000}).present();
            });
            console.log(data);
            this.navCtrl.popToRoot();
        })
        .catch((err)=>{
            loading.dismiss().then(()=>{
                this.alert.create({title:"Error",message: JSON.stringify(err), buttons:["Ok"] }).present();
            });
        });
    }


}
