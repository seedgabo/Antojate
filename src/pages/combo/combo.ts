import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Api } from '../../providers/Api';
@Component({
  selector: 'page-combo',
  templateUrl: 'combo.html'
})
export class ComboPage {
  combos = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public alert:AlertController) { }

  ionViewDidLoad() {
    this.api.get('combos?scope[active]')
      .then((data: any) => {
        this.combos = data;
        console.log(data);
      })
      .catch(
        (err)=>{
            console.error(err);
            this.alert.create({message: JSON.stringify(err) ,buttons:["OK"], title: "Error al cargar productos"}).present();
        }
      );
  }


}
