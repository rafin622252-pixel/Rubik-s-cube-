const FACE_ORDER = ["U","R","F","D","L","B"];
const COLORS = {
  U:{name:"White",hex:"#f5f5f0"}, R:{name:"Red",hex:"#e94d55"},
  F:{name:"Green",hex:"#20b878"}, D:{name:"Yellow",hex:"#f4c542"},
  L:{name:"Orange",hex:"#f18b35"}, B:{name:"Blue",hex:"#3978e8"}
};
let selectedColor = "U";
let facelets = {};
let solutionMoves = [];
let currentStep = 0;
let CubeSolver = window.Cube;

function resetFaces(){
  facelets = {};
  FACE_ORDER.forEach(face => facelets[face] = Array(9).fill(face));
}
function render(){
  const net = document.getElementById("cubeNet");
  net.innerHTML = "";
  ["U","L","F","R","B","D"].forEach(face=>{
    const wrap = document.createElement("div");
    wrap.className = `face face-${face}`;
    const label = document.createElement("div");
    label.className = "face-label";
    label.textContent = `${face} · ${({U:"UP",R:"RIGHT",F:"FRONT",D:"DOWN",L:"LEFT",B:"BACK"})[face]}`;
    wrap.appendChild(label);
    facelets[face].forEach((color,i)=>{
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "sticker" + (i===4?" center":"");
      cell.style.background = COLORS[color].hex;
      cell.setAttribute("aria-label",`${face} face sticker ${i+1}: ${COLORS[color].name}`);
      if(i===4){cell.title="Center color is fixed";}
      else cell.addEventListener("click",()=>{facelets[face][i]=selectedColor;render();});
      wrap.appendChild(cell);
    });
    net.appendChild(wrap);
  });
  document.querySelectorAll(".color-choice").forEach(el=>el.classList.toggle("selected",el.dataset.color===selectedColor));
}
function buildPalette(){
  const palette=document.getElementById("palette");
  FACE_ORDER.forEach(face=>{
    const b=document.createElement("button");
    b.className="color-choice";b.type="button";b.dataset.color=face;
    b.style.background=COLORS[face].hex;b.title=COLORS[face].name;
    b.addEventListener("click",()=>{selectedColor=face;render();});
    palette.appendChild(b);
  });
}
function showError(message){
  const box=document.getElementById("errorBox");
  box.textContent=message;box.classList.remove("hidden");
  document.getElementById("solutionState").classList.add("hidden");
  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("status").textContent="CHECK INPUT";
}
function hideError(){document.getElementById("errorBox").classList.add("hidden");}
function toFaceletString(){
  // cube.js expects faces in URFDLB order; each face is entered row by row.
  return FACE_ORDER.map(face=>facelets[face].join("")).join("");
}
function validateCounts(str){
  const counts={U:0,R:0,F:0,D:0,L:0,B:0};
  for(const c of str) counts[c]++;
  return Object.entries(counts).every(([,n])=>n===9);
}
function showSolution(alg){
  solutionMoves=alg.trim()?alg.trim().split(/\s+/):[];
  currentStep=0;
  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("solutionState").classList.remove("hidden");
  document.getElementById("moveCount").textContent=solutionMoves.length;
  document.getElementById("status").textContent="SOLUTION READY";
  const holder=document.getElementById("moves");holder.innerHTML="";
  solutionMoves.forEach((move,i)=>{
    const chip=document.createElement("button");
    chip.className="move-chip";chip.textContent=move;chip.type="button";
    chip.addEventListener("click",()=>setStep(i+1));
    holder.appendChild(chip);
  });
  updateStep();
}
function setStep(n){currentStep=Math.max(0,Math.min(n,solutionMoves.length));updateStep();}
function updateStep(){
  document.querySelectorAll(".move-chip").forEach((el,i)=>el.classList.toggle("active",i===currentStep-1));
  document.getElementById("stepLabel").textContent=`Step ${currentStep} of ${solutionMoves.length}`;
  document.getElementById("currentMove").textContent=currentStep===0?"Start with the first move":`Next move: ${solutionMoves[currentStep-1]}`;
  document.getElementById("prevBtn").disabled=currentStep===0;
  document.getElementById("nextBtn").disabled=currentStep>=solutionMoves.length;
}
document.getElementById("solveBtn").addEventListener("click",()=>{
  hideError();
  if(!CubeSolver || typeof CubeSolver.initSolver!=="function"){
    showError("The solver library did not load. Check your internet connection, refresh the page, and try again.");
    return;
  }
  const str=toFaceletString();
  if(!validateCounts(str)){showError("Each color must appear exactly 9 times. Check the six faces and try again.");return;}
  const btn=document.getElementById("solveBtn");
  btn.disabled=true;btn.textContent="Preparing solver…";
  document.getElementById("status").textContent="WORKING";
  setTimeout(()=>{
    try{
      CubeSolver.initSolver();
      const cube=CubeSolver.fromString(str);
      const answer=cube.solve();
      if(answer===null || answer===undefined) throw new Error("No solution found for this color arrangement.");
      showSolution(answer);
    }catch(err){
      showError("This color arrangement may be impossible or entered incorrectly. Check that every sticker matches your real cube, including the center colors. ("+err.message+")");
    }finally{
      btn.disabled=false;btn.innerHTML='Solve my cube <span>→</span>';
    }
  },40);
});
document.getElementById("resetBtn").addEventListener("click",()=>{
  resetFaces();hideError();solutionMoves=[];render();
  document.getElementById("solutionState").classList.add("hidden");
  document.getElementById("emptyState").classList.remove("hidden");
  document.getElementById("status").textContent="WAITING";
});
document.getElementById("scrambleBtn").addEventListener("click",()=>{
  if(!CubeSolver){showError("Solver library is not loaded. Check your internet connection.");return;}
  try{
    const cube=new CubeSolver();cube.randomize();
    const state=cube.asString();
    let p=0;
    FACE_ORDER.forEach(face=>{facelets[face]=state.slice(p,p+9).split("");p+=9;});
    // asString() is already URFDLB and matches our face order.
    hideError();render();
    document.getElementById("solutionState").classList.add("hidden");
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("status").textContent="EXAMPLE LOADED";
  }catch(e){showError("Could not generate an example scramble: "+e.message);}
});
document.getElementById("prevBtn").addEventListener("click",()=>setStep(currentStep-1));
document.getElementById("nextBtn").addEventListener("click",()=>setStep(currentStep+1));
document.getElementById("copyBtn").addEventListener("click",async()=>{
  const text=solutionMoves.join(" ");
  try{await navigator.clipboard.writeText(text);document.getElementById("copyBtn").textContent="Copied!";}
  catch(e){document.getElementById("copyBtn").textContent="Copy unavailable";}
});
resetFaces();buildPalette();render();
