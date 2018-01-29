import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { XirsysV3Provider } from '../../providers/xirsys-v3/xirsys-v3';
//import * as socketio from 'socket.io-client';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	// sock = null;
  //
	// peerConnection = null;

  sessionMenuClass: string = '';

  constructor(
		public navCtrl: NavController,
    private androidPermissions: AndroidPermissions,
    public xirsysV3: XirsysV3Provider
	) {
    console.log("hello??");

    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.RECORD_AUDIO]);
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      success => console.log("Hey you have permission"),
      err => {console.log("Uh oh"); this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA);}
    );

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
      success => console.log("Hey you have permission"),
      err => {console.log("Uh oh"); this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO);}
    );

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        console.log("got here");
        let video = document.getElementById('user-video-element');
        (<HTMLVideoElement>video).srcObject = stream;
      })
      .catch(e => {
        console.log("MESSAGE");
        console.log(e);
        console.log("EOMESSAGE");
      });

		//const SERVER_ADDRESS = 'http://5cf0c64f.ngrok.io';
		// const PC_Configuration = {};
		//this.sock = socketio(SERVER_ADDRESS);
		// this.peerConnection = new RTCPeerConnection(PC_Configuration);

		//this.sock.on('omae_wa_mou_shindeiru', () => {
		//	console.log("NANI?")
		//});

		// navigator.mediaDevices.getUserMedia({video: true, audio: false})
		//   .then( stream => {
		// 	     let video = document.getElementById('user-video-element');
		// 			 (<HTMLVideoElement>video).srcObject = stream;
    //        console.log(video.srcObject);
		// 	})
		// 	.catch(err => {
		// 	     console.log("Error occured" + err);
		// 	});
    this.getUsers();
  }

  sessionMenuOpen(){
    this.sessionMenuClass = 'session-menu-open';
  }

  getUsers() {
  this.xirsysV3.getUsers()
  .then(data => {
    console.log(data);
    });
  }

}
