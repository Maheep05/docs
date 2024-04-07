import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import {io} from 'socket.io-client';
import { useParams } from 'react-router-dom';

export function Editor() {
    const [socket,setSocket] = useState();
    const [quill,setQuill] = useState();
    const { id } = useParams();

    // extra toolkit
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean']                                         // remove formatting button
    ];


    //for Quill Editor mounting 
    useEffect(() => {
        const container = document.getElementById('container');
        if (container && !container.querySelector('.ql-editor')) {
            const quillEditor = new Quill(container, {
                theme: 'snow',
                modules: { toolbar: toolbarOptions }
            });
            quillEditor.disable();
            quillEditor.setText("Loading the document");
            setQuill(quillEditor);
        }
    }, []);


    // for client-side connection
    useEffect(()=>{
       const socketServer =  io('http://localhost:9000');
        setSocket(socketServer);
       
        return () => {
            socketServer.disconnect();
       }
    },[])


    useEffect(()=>{

        if(socket === null || quill === null) return ;
        function handleChange(delta,oldDelta,source){

            if (source !== 'user') return;
            socket && socket.emit('send-changes' , delta);

        }

        quill && quill.on('text-change' ,handleChange);
        

        return ()=>{
            quill && quill.off('text-change' , handleChange);
        }
    },[quill , socket])


    useEffect(()=>{

        if(socket === null || quill === null) return ;
       
        function handleChange(delta){
            quill.updateContents(delta);
        }

        socket && socket.on('receive-changes' ,handleChange);
        

        return ()=>{
            socket && socket.off('receive-changes' , handleChange);
        }
    },[quill , socket])

    useEffect(()=>{ 
        if(quill === null || socket === null) return ;
        socket && socket.once('load-document' , document => {
            quill && quill.setContents(document);
            quill && quill.enable();
        })
        socket && socket.emit('get-document' , id);
    },[quill,socket,id])


    useEffect(()=>{ 
        if(quill === null || socket === null) return ;
       
        const saveInterval = setInterval(()=>{
            socket && socket.emit('save-document',quill.getContents());
       } , [2000]);

       return ()=>{
        clearInterval(saveInterval);
       }
    },[quill,socket])

    return (
        <div className='bg-[#F5F5F5] min-h-screen flex flex-col items-center sticky top-0 z-10'>
                <div id='container' className=' w-[60%] bg-white shadow-lg my-10 min-h-screen'>

                </div>
        </div>
    )
}