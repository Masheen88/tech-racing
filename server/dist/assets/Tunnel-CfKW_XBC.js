import{j as n,P as e}from"./index-BJ5GaQx0.js";const u=({id:r,position:i,size:t,isVisible:s})=>{const o={zIndex:1,position:"absolute",left:`${i.x}px`,top:`${i.y}px`,width:`${t.width}px`,height:`${t.height}px`,transform:`rotate(${i.rotation}deg)`,backgroundColor:"#2b7dc2",opacity:s?1:.5,transition:"opacity 2.5s"};return n.jsx("div",{id:r,style:o})};u.propTypes={id:e.string.isRequired,position:e.shape({x:e.number.isRequired,y:e.number.isRequired,rotation:e.number.isRequired}).isRequired,size:e.shape({width:e.number.isRequired,height:e.number.isRequired}).isRequired,isVisible:e.bool.isRequired};export{u as default};