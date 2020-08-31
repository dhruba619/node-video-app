const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
}); 

let myVideoStream;
navigator.mediaDevices.getUserMedia({ 
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    myVideo.muted = true;
    addVideoStream(myVideo, myVideoStream);

    peer.on('call', call => {
        console.log("Called");
        call.answer(stream);
        console.log("Answered");
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            console.log("Added call video");
            addVideoStream(video, userVideoStream);
        });
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });

    let text = $('input');
    $('html').keydown((e) => {
        if(e.which == 13 && text.val().length!= 0) {
            console.log(text.val());
            socket.emit('message',text.val());
            text.val('');
        }
    });

    socket.on('createMessage',  (message, username) => {
        $('ul').append(`<li class="message"><b>${username}</b><br/>${message}</li>`);
        scrollToBottom();
    });
});


peer.on('open', id => {
    let username = prompt("Please enter your name", "Harry Potter");
    if(username!=null) {
        socket.emit('join-room', ROOM_ID, id, username);
    } else {
        socket.emit('join-room', ROOM_ID, id, 'User');
    }
    
});


const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
}


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>`
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.main__mute__button').innerHTML = html;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>`
    document.querySelector('.main__video__button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>`
    document.querySelector('.main__video__button').innerHTML = html;
}

const leaveMeeting = () => {
    window.close();
}