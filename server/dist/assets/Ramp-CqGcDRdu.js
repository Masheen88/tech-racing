import{j as s,P as t}from"./index-g6nYrqbt.js";const p=({id:i,position:e,size:r,direction:o})=>{const a={position:"absolute",left:`${e.x}px`,top:`${e.y}px`,width:`${r.width}px`,height:`${r.height}px`,transform:`rotate(${e.rotation}deg)`,backgroundColor:"green",zIndex:5},n={position:"absolute",width:"0",height:"0",borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:"20px solid white"},d=u=>{switch(u){case"up":return{top:"10%",left:"50%",transform:"translateX(-50%) rotate(180deg)"};case"down":return{bottom:"10%",left:"50%",transform:"translateX(-50%) rotate(0deg)"};case"left":return{left:"10%",top:"50%",transform:"translateY(-50%) rotate(-270deg)"};case"right":return{right:"10%",top:"50%",transform:"translateY(-50%) rotate(270deg)"};default:return{}}};return s.jsx("div",{id:i,style:a,"data-direction":o,children:s.jsx("div",{style:{...n,...d(o)}})})};p.propTypes={id:t.string.isRequired,position:t.shape({x:t.number.isRequired,y:t.number.isRequired,rotation:t.number.isRequired}).isRequired,size:t.shape({width:t.number.isRequired,height:t.number.isRequired}).isRequired,direction:t.string.isRequired};export{p as default};