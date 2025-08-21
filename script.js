let cards = JSON.parse(localStorage.getItem("cards")) || [];
let current = 0;
let editingIndex = null;

function renderCard(){
  if(cards.length===0){
    document.getElementById("question").textContent="কোনো কার্ড নেই।";
    document.getElementById("answer").style.display="none";
    document.getElementById("explanation").style.display="none";
    document.getElementById("views").textContent="";
    updateProgress();
    return;
  }
  const card = cards[current];
  document.getElementById("question").textContent = card.input;
  document.getElementById("answer").textContent = card.answer;
  document.getElementById("explanation").textContent = card.explanation;
  document.getElementById("answer").style.display="none";
  document.getElementById("explanation").style.display="none";
  card.views = (card.views || 0) +1;
  localStorage.setItem("cards", JSON.stringify(cards));
  document.getElementById("views").textContent = "Views: "+card.views;
  updateProgress();
}

document.getElementById("showAnswer").onclick = ()=>{
  document.getElementById("answer").style.display="block";
  document.getElementById("explanation").style.display="block";
};

document.getElementById("prev").onclick = ()=>{
  if(current>0){ current--; renderCard(); }
};
document.getElementById("next").onclick = ()=>{
  if(current<cards.length-1){ current++; renderCard(); }
};

document.getElementById("editCard").onclick = ()=>{
  if(cards.length===0) return;
  openForm("addForm");
  const card = cards[current];
  document.getElementById("inputField").value = card.input;
  document.getElementById("answerField").value = card.answer;
  document.getElementById("explanationField").value = card.explanation;
  editingIndex = current;
};

document.getElementById("deleteCard").onclick = ()=>{
  if(cards.length===0) return;
  if(!confirm("মুছে ফেলতে চান?")) return;
  cards.splice(current,1);
  localStorage.setItem("cards", JSON.stringify(cards));
  if(current>=cards.length) current = cards.length-1;
  renderCard();
};

function addOrEditCard(){
  const input = document.getElementById("inputField").value.trim();
  const answer = document.getElementById("answerField").value.trim();
  const explanation = document.getElementById("explanationField").value.trim();
  if(!input || !answer) return alert("প্রশ্ন ও উত্তর লিখুন!");
  if(editingIndex!==null){
    cards[editingIndex] = {input, answer, explanation, views:cards[editingIndex].views || 0};
    editingIndex = null;
  } else {
    cards.push({input, answer, explanation, views:0});
    current = cards.length-1;
  }
  localStorage.setItem("cards", JSON.stringify(cards));
  closeForm();
  renderCard();
}

function updateProgress(){
  if(cards.length===0) return document.getElementById("progress-fill").style.width="0%";
  const doneCount = cards.filter(c=>c.views>0).length;
  const percent = Math.round((doneCount/cards.length)*100);
  const bar = document.getElementById("progress-fill");
  bar.style.width = percent+"%";
  bar.textContent = percent+"%";
}

function openForm(id){
  document.getElementById("overlay").style.display="block";
  document.getElementById(id).style.display="block";
}
function closeForm(){
  document.getElementById("overlay").style.display="none";
  document.getElementById("addForm").style.display="none";
  document.getElementById("backupForm").style.display="none";
  document.getElementById("textBackupForm").style.display="none";
  editingIndex=null;
}

document.getElementById("addCardBtn").onclick = ()=> openForm("addForm");
document.getElementById("backupBtn").onclick = ()=> openForm("backupForm");
document.getElementById("textBackupBtn").onclick = ()=> openForm("textBackupForm");

// JSON Backup / Restore
function backupData(){
  if(cards.length===0) return alert("কোনো কার্ড নেই!");
  const dataStr = JSON.stringify(cards,null,2);
  const blob = new Blob([dataStr], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards_backup.json";
  a.click();
  URL.revokeObjectURL(url);
}
function importData(){
  const fileInput = document.getElementById("importFile");
  if(fileInput.files.length===0) return alert("ফাইল সিলেক্ট করুন!");
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const imported = JSON.parse(e.target.result);
      if(!Array.isArray(imported)) throw "Invalid JSON";
      cards = imported;
      localStorage.setItem("cards", JSON.stringify(cards));
      current=0;
      renderCard();
      alert("Restore সফল হয়েছে!");
      closeForm();
    }catch(err){ alert("ফাইলটি সঠিক নয়।"); }
  }
  reader.readAsText(file);
}

// Plain Text Backup / Restore
function exportText(){
  if(cards.length===0) return alert("কোনো কার্ড নেই!");
  let textData = cards.map(c => 
`প্রশ্ন: ${c.input}
উত্তর: ${c.answer}
ব্যাখ্যা: ${c.explanation}
ভিউ: ${c.views || 0}
---`).join("\n");
  const blob = new Blob([textData], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards_backup.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function importText(){
  const fileInput = document.getElementById("importTextFile");
  if(fileInput.files.length===0) return alert("ফাইল সিলেক্ট করুন!");
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const lines = e.target.result.split("\n");
      const imported = [];
      let temp = {};
      for(let line of lines){
        line = line.trim();
        if(line.startsWith("প্রশ্ন:")) temp.input = line.slice(6).trim();
        else if(line.startsWith("উত্তর:")) temp.answer = line.slice(7).trim();
        else if(line.startsWith("ব্যাখ্যা:")) temp.explanation = line.slice(7).trim();
        else if(line.startsWith("ভিউ:")) temp.views = parseInt(line.slice(4).trim()) || 0;
        else if(line==="---"){ imported.push({...temp}); temp={}; }
      }
      if(imported.length>0){
        cards = imported;
        localStorage.setItem("cards", JSON.stringify(cards));
        current=0;
        renderCard();
        alert("Text Restore সফল হয়েছে!");
        closeForm();
      } else alert("কোনো কার্ড পাওয়া যায়নি।");
    }catch(err){ alert("ফাইলটি সঠিক নয়।"); }
  }
  reader.readAsText(file);
}

renderCard();
