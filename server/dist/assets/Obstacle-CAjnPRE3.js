import{j as d,P as e}from"./index-g6nYrqbt.js";const u=({id:s,position:r,size:i,rotation:t})=>{const o={position:"absolute",left:`${r.x}px`,top:`${r.y}px`,width:`${i.width}px`,height:`${i.height}px`,transform:`rotate(${t}deg)`,backgroundColor:"blue",border:"1px dashed green"};return d.jsx("div",{id:s,style:o})};u.propTypes={id:e.string.isRequired,position:e.shape({x:e.number.isRequired,y:e.number.isRequired}).isRequired,size:e.shape({width:e.number.isRequired,height:e.number.isRequired}).isRequired,rotation:e.number.isRequired};export{u as default};
