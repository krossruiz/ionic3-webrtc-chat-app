import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { XirsysV3Provider } from '../../providers/xirsys-v3/xirsys-v3';
import * as socketio from 'socket.io-client';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  sock: any;
	peerConnection: any;
  serverPeerConnection: any;
  sessionMenuClass: string = '';
  xExitButtonClass: string = '';
  SERVER_ADDRESS: string =  "https://593f2a20.ngrok.io";
  username: string = "";
  messageDataChannel: any;
  serverSocketActions: any;
  activeUsers = [];

  constructor(
		public navCtrl: NavController,
    private androidPermissions: AndroidPermissions,
    public xirsysV3: XirsysV3Provider
	){
    this.checkPermissions();
    this.connectToNodeServer();
    this.configureServerSocket();
    this.getCameraStream();
    this.getUsers();
  }

  connectToNodeServer(){
    this.sock = socketio(this.SERVER_ADDRESS);
  }

  checkPermissions(){
    this.androidPermissions.requestPermissions(
      [this.androidPermissions.PERMISSION.CAMERA,
        this.androidPermissions.PERMISSION.RECORD_AUDIO
      ]
    );

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      success => console.log("Hey you have permission"),
      err => {
        console.log("Uh oh, looks like you don't have permission");
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA);
      }
    );

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
      success => console.log("Hey you have permission"),
      err => {
        console.log("Uh oh, looks like you don't have permission");
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO);
      }
    );
  }

  getCameraStream(){
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        let video = document.getElementById('user-video-element');
        (<HTMLVideoElement>video).srcObject = stream;
      })
      .catch(e => {
        console.log(e);
      });
  }

  displayNameChange(updatedDisplayName){
    this.serverSocketActions.updateDisplayName(updatedDisplayName);
  }

  displayNameSubstringer(displayName){
    if(displayName.length < 12){
      return displayName;
    }
    else{
      return displayName.substring(0,11) + "...";
    }
  }

  sessionMenuOpen(){
    this.sessionMenuClass = 'session-menu-open';
    this.xExitButtonClass = 'x-exit-button-active';
  }

  sessionMenuClose(){
    this.sessionMenuClass = 'session-menu-close';
    this.xExitButtonClass = 'x-exit-button-inactive';
  }

  createPeerConnection(){
    this.peerConnection = new webkitRTCPeerConnection({});
    this.peerConnection.onicecandidate = this.serverSocketActions.onIceCandidate;
    this.peerConnection.ondatachannel = this.onDataChannel;
  }

  createMessagingDataChannel(){
    let self = this;
    let messageDataCHannelOptions = {
      ordered: true,
      maxRetransmitTime: 3000
    };
  }

  onDataChannel(event){
    event.channel.onmessage = (ev) => {
      try{
        console.log(ev.data);
      }
      catch(e){
        console.log(e);
      }
    };
  }

  createOffer(){
    this.peerConnection.createOffer()
      .then( (offer) => {
        this.peerConnection.setLocalDescription(offer);
        this.serverSocketActions.createInitialOffering(offer);
      });
  }

  configureServerSocket(){

    this.serverSocketActions = {
      requestSession: (remoteUserId) => {
        this.sock.emit('request-session', remoteUserId);
      },
      updateDisplayName: (updatedDisplayName) => {
        this.sock.emit('updated-display-name', updatedDisplayName);
      },
      createInitialOffering: (offer) => {
        this.sock.emit('initial-offering', offer);
      },
      onIceCandidate: (event) => {
        this.sock.emit('candidate', event.candidate);
      }
    };

    this.sock.on('display-names-updated', (activeUsers) => {
      let i = 0;
      for(let user in activeUsers.users){
        this.activeUsers[i] = activeUsers.users[user];
        i++;
      };
    });

    this.sock.on('initial-offering-response', remoteOffer => {
      this.peerConnection.setRemoteDescription(remoteOffer)
        .then( (answer) => {
          this.peerConnection.setLocalDescription(answer);
          this.sock.emit('answer', answer);
        });
    });

    this.sock.on('answer-given', (remoteAnswer) => {
      this.peerConnection.setRemoteDescription(remoteAnswer)
        .then(() => {
          console.log(this.peerConnection);
        });
    });

  }

  getUsers() {
  this.xirsysV3.getUsers()
  .then(data => {
    console.log(data);
    });
  }

}
