import React, {useEffect, useState} from 'react';



interface MeaningfulMoment {
   timestamp: string,
   emote: string,
   count: number,
   totalEmotes: number;

}

export default function  App () {

 const [moments, setMoments] = useState<MeaningfulMoment[]>([]);
 const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   const socket = new WebSocket('ws://localhost:3000');

   socket.onopen = () => {
     setConnectionStatus('connected');
     setError(null);
   }
   socket.onmessage = ( event: MessageEvent) => {
       
       try{
      
 
       const meaningfulMoment :  MeaningfulMoment = JSON.parse(event.data);
       setMoments(prev => [{...meaningfulMoment, ratio: meaningfulMoment.count / meaningfulMoment.totalEmotes} , ...prev.slice(0, 49)

       ]);
       
     }catch(err){
        console.error('Message parsing error:', err);
        setError('Invalid data received');
     }
   };
     return () => socket.close();
    
 },[connectionStatus]);

 return (
    <>
       <h1>Meaningful Moments </h1>
      
       <p>
        {connectionStatus === 'connecting' && 'Connecting to WebSocket...'}
        {connectionStatus === 'connected' && 'Connected to WebSocket'}
        {connectionStatus === 'error' && `Connection Error: ${error}`}

       </p>
       <ul>
       {moments.map((moment, index) => (

        <li key={index}>
       <strong>{moment.emote}</strong> - 
       {moment.count} out of 
       {moment.totalEmotes} emotes at

       { new Date (moment.timestamp).toLocaleTimeString()}
        

        </li>


       ))}



       </ul>
    
    
    
    
    </>
 )
} 
