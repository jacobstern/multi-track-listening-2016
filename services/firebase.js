import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

// Firebase has to be a singleton
const globalScope = typeof window === 'undefined' ? global : window
let app = globalScope.app

if (typeof app === 'undefined') {
  const config = {
    apiKey: 'AIzaSyB3-deBYb72JUc1dEuzbYof3yNebKdeVXE',
    authDomain: 'multi-track-listening.firebaseapp.com',
    databaseURL: 'https://multi-track-listening.firebaseio.com',
    storageBucket: 'multi-track-listening.appspot.com',
    messagingSenderId: '1054864619310'
  }
  app = firebase.initializeApp(config)
  globalScope.app = app
}

export default app
