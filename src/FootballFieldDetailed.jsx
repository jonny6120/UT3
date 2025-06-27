
import React from "react";

export default function FootballFieldDetailed() {
  const yardLines = [];
  for (let i = 0; i <= 100; i += 10) {
    let label = i === 50 ? "50" : (i % 50).toString();
    if (i > 50) label = (100 - i).toString();  // flip labels after midfield

    yardLines.push(
      <div key={"yard-" + i}
        style={{
          position: "absolute",
          top: 0,
          left: `calc(8.33% + ${(i / 100) * 83.34}%)`,
          height: "100%",
          borderLeft: "2px solid white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          fontSize: "10px",
          pointerEvents: "none"
        }}>
        <div style={{ marginTop: "4px" }}>{label}</div>
        <div style={{ marginBottom: "4px", transform: "rotate(180deg)" }}>{label}</div>
      </div>
    );
  }

  const hashMarks = [];
  for (let i = 1; i < 100; i++) {
    const left = `calc(8.33% + ${(i / 100) * 83.34}%)`;
    hashMarks.push(
      <React.Fragment key={"hash-" + i}>
        <div style={{position:"absolute", width:"2px", height:"2px", background:"white", top:"70px", left}} />
        <div style={{position:"absolute", width:"2px", height:"2px", background:"white", bottom:"70px", left}} />
      </React.Fragment>
    );
  }

  return (
    <div style={{
      width:"100%",
      height:"280px",
      background:"#0a5",
      position:"relative",
      overflow:"hidden",
      border:"2px solid white"
    }}>
      {/* Endzones */}
      <div style={{position:"absolute",left:0,top:0,width:"8.33%",height:"100%",background:"#800000",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"10px"}}>Endzone</div>
      <div style={{position:"absolute",right:0,top:0,width:"8.33%",height:"100%",background:"#800000",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"10px"}}>Endzone</div>

      {/* Yard lines & numbers */}
      {yardLines}

      {/* Hash marks */}
      {hashMarks}

      {/* Center Logo */}
      <div style={{position:"absolute",top:"50%",left:"50%",width:"40px",height:"40px",background:"white",opacity:0.3,transform:"translate(-50%,-50%)",borderRadius:"50%"}}></div>
    </div>
  );
}
