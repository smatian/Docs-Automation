console.log('popup.js loaded');
// document.getElementById('open-picker').addEventListener('click', () => {
//   window.open('https://drive-callback.vercel.app/', '_blank', 'width=800,height=600')
// });




  // document.getElementById('startTypingButton').addEventListener('click', () => {
  //   chrome.runtime.sendMessage({
  //     action: 'startTyping',
  //     args: [contentToType, typingSpeed, mistakeRate, correctionSpeed, breakTime, breakInterval]
  //   });
  // });
  
  // document.getElementById('authorize_button').addEventListener('click', handleAuthClick);
  // document.getElementById('signout_button').addEventListener('click', handleSignoutClick);
  
  // function handleAuthClick() {
  //   chrome.storage.local.get('accessToken', function(data) {
  //     if (data.accessToken) {
  //       loadPicker(data.accessToken);
  //     } else {
  //       console.error('No access token available');
  //     }
  //   });
  // }
  
  // function handleSignoutClick() {
  //   chrome.storage.local.remove('accessToken', function() {
  //     console.log('Token removed');
  //   });
  // }
  
  // function loadPicker(accessToken) {
  //   gapi.load('picker', {'callback': function() {
  //     const view = new google.picker.View(google.picker.ViewId.DOCS);
  //     const picker = new google.picker.PickerBuilder()
  //       .addView(view)
  //       .setOAuthToken(accessToken)
  //       .setDeveloperKey('YOUR_API_KEY')
  //       .setCallback(pickerCallback)
  //       .build();
  //     picker.setVisible(true);
  //   }});
  // }
  
  // function pickerCallback(data) {
  //   if (data.action === google.picker.Action.PICKED) {
  //     const fileId = data.docs[0].id;
  //     document.getElementById('content').innerText = `Picked file ID: ${fileId}`;
  //   }
  // }
  