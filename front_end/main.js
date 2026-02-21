// Elementos da tela de login


const container_login = document.getElementById("tela_login");
const centralizador = document.querySelector(".centralizador");
const container_tela_principal = document.getElementById("tela_principal");
let nome_usuario = document.getElementById("nome"); //NOMEUSUARIO
let senha_usuario = document.getElementById("senha");   //SENHAUSUARIO

const btn_login = document.getElementById("login");
const sign_in = document.getElementById("sign-in");


container_tela_principal.style.display="none";

// Elementos da tela principal
let feiticeiro=document.getElementById("feiticeiro");

const display_timer=document.getElementById("timer")
const display_break=document.getElementById("break")

const playtimer=document.getElementById("play_timer");
const pausetimer=document.getElementById("pause_timer");

const tempo_estudo=document.getElementById("tempo_escolhido");
const tempo_pausa=document.getElementById("tempo_escolhido_pausa");

let tempo_Restante=0;
let tempo_Restante_pausa=0;

const empty_tasks_container=document.getElementById("empty_tasks_container");


const add_task=document.getElementById("btn_add_tarefa");
const input_task=document.getElementById("nova_tarefa_input");
const lista_to_do=document.getElementById("lista_a_fazer");

const lista_em_andamento = document.getElementById("lista_em_andamento");
const lista_concluidas = document.getElementById("lista_concluidas");

let tempo_total_estudo=0

let feiticeiro_id_logado = null


//  Funcao para manipular as checkboxes
add_task.addEventListener("click", ()=>{
    const texto_tarefa=input_task.value.trim();

    if(texto_tarefa!==""){
        const div_tarefa=document.createElement("div");
        div_tarefa.classList.add("tarefa_item");

        const checkbox=document.createElement("input");
        checkbox.type="checkbox";

        const id_unico = "task_" + Date.now(); 
        checkbox.id = id_unico;

        const label=document.createElement("label");
        label.htmlFor=id_unico;
        label.innerText=texto_tarefa;

        checkbox.addEventListener("change", function(){
            if(this.checked){
                setTimeout(async()=>{
                    if (div_tarefa.parentElement === lista_a_fazer) {

                        lista_em_andamento.prepend(div_tarefa);
                        this.checked = false; 
                        
                    } else if (div_tarefa.parentElement === lista_em_andamento) {
 
                        lista_concluidas.prepend(div_tarefa);
                        this.checked = false;
                        this.disabled = true; 
                        div_tarefa.classList.add("finalizada"); 

                        let minutos_estudados=Math.floor(tempo_total_estudo/60);
                        await salvarTarefa(texto_tarefa, minutos_estudados);
                    }
                }, 400)
            }
        })

        div_tarefa.appendChild(checkbox);
        div_tarefa.appendChild(label);

        lista_a_fazer.appendChild(div_tarefa);
        input_task.value = "";
    }
})



async function fazerLogin(){
    nome=nome_usuario.value;
    senha=senha_usuario.value;

    if(nome==="" || senha===""){
        alert("Feiticeiro deve inserir seu Nome e sua Senha para acessar seus arquivos!");
        return;
    }
    const resposta=await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify({nome:nome, senha:senha})
    });
    const dados = await resposta.json();

    if(dados.status==='sucesso'){
        alert(dados.msg);
        displayTelaPrincipal()
        feiticeiro_id_logado=dados.id_usuario;
    }else{
        alert("Erro no Login: "+dados.msg)
    }
}



async function fazerSignUp(){
    nome=nome_usuario.value;
    senha=senha_usuario.value;

    if(nome==="" || senha===""){
        alert("Feiticeiro deve inserir seu Nome e sua Senha para acessar seus arquivos!");
        return;
    }

    const resposta=await fetch('http://127.0.0.1:8000/usuarios', {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({nome:nome, senha:senha})
    });
    const dados=await resposta.json();

    if(dados.status==="Sucesso"){
        alert("Cadastro realizado! Agora faça o login.");
    }else{
        alert("Erro no cadastro: "+ dados.mensagem);
    }
}

async function salvarTarefa(texto_tarefa, minutos_estudados){
    if(!feiticeiro_id_logado){
        console.error("Erro: Tentativa de salvar tarefa sem usuário logado.");
        return;
    }
    try{
        const resposta = await fetch('http://127.0.0.1:8000/tarefas', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                usuario_id:feiticeiro_id_logado,
                descricao:texto_tarefa,
                tempo_est_min:minutos_estudados
            })
        });
        const dados = await resposta.json();
        console.log("Resposta do grimório:", dados.mensagem);
    } catch(erro){
        console.log("Erro na comunicação com o grimório:", erro);
    }
}



function displayTelaPrincipal(){
    centralizador.style.display = "none";
    container_tela_principal.style.display = "flex";
    feiticeiro.innerText = nome;
}

let pomodoro_binario=0;
let segundosCorridos = 0;
let cronometro = null;

function play_pomodoro_Timer(){
    //Verificando se Tempo esta zerado
    if (segundosCorridos <= 0 && pomodoro_binario == 0) {
        alert("Escolha um tempo de estudo primeiro, Feiticeiro!");
        return; 
    }

    if(pomodoro_binario==0){
        playtimer.innerHTML="<span>pause</span>";
        pomodoro_binario=1;

        cronometro=setInterval(()=>{
            if(segundosCorridos>0){
            segundosCorridos--;
            console.log(tempo_total_estudo);
            tempo_total_estudo++;
            display_timer.innerHTML=formatarTempo(segundosCorridos);
            }else{
                clearInterval(cronometro);
                playtimer.innerHTML = "<span>play_arrow</span>";
                pomodoro_binario = 0;
                alert("Sessão finalizada! Iniciando tempo de Pausa");

                cronometro=setInterval(()=>{
                    if(tempo_Restante_pausa>0){
                        tempo_Restante_pausa--;
                        display_break.innerText=formatarTempo(tempo_Restante_pausa);
                    }else{
                        clearInterval(cronometro);
                        playtimer.innerHTML="<span>play_arrow</span>";
                        pomodoro_binario=0;
                        alert("Fim do descanso!");
                        let min_estudos=parseInt(tempo_estudo.value);
                        let min_pausa=parseInt(tempo_pausa.value);

                        segundosCorridos=min_estudos*60;
                        tempo_Restante_pausa=min_pausa*60;

                        display_timer.innerText = formatarTempo(segundosCorridos);
                        display_break.innerText = formatarTempo(tempo_Restante_pausa); 

                        tempo_estudo.innerText=tempo_estudo.value+' min'
                        tempo_pausa.innerText=tempo_pausa.value+' min'
                    }
                },1000);
            }
        }, 1000);

    }else{
        playtimer.innerHTML="<span>play_arrow</span>";
        pomodoro_binario=0;
        clearInterval(cronometro);
        cronometro=null;
    }
    empty_tasks_container.style.display="none";
}

function pause_pomodoro_Timer(){
    playtimer.innerHTML="<span>play_arrow</span>"
    pomodoro_binario=0;
    clearInterval(cronometro);
    cronometro=null;

    segundosCorridos=0;

    display_timer.innerText="00:00";
    empty_tasks_container.style.display="flex";
}

function formatarTempo(segundos_totais) {
    const minutos = Math.floor(segundos_totais / 60);
    const segundos = segundos_totais % 60;
    

    const minFormatado = String(minutos).padStart(2, '0');
    const segFormatado = String(segundos).padStart(2, '0');
    
    return `${minFormatado}:${segFormatado}`;
}

tempo_estudo.addEventListener("change", (event)=>{
    let minutos=parseInt(event.target.value);

    if(!isNaN(minutos)){
        segundosCorridos=minutos*60;

        display_timer.innerText=formatarTempo(segundosCorridos);
    }
})

tempo_pausa.addEventListener("change", (event)=>{
    let minutos_pausa=parseInt(event.target.value);

    if(!isNaN(minutos_pausa)){
        tempo_Restante_pausa=minutos_pausa*60;
        display_break.innerText=formatarTempo(tempo_Restante_pausa);
    }
})

tempo_estudo.addEventListener("focus", (event) => {
    event.target.value = "";
});

tempo_pausa.addEventListener("focus", (event) => {
    event.target.value = "";
});

btn_login.addEventListener("click", fazerLogin);

sign_in.addEventListener("click", fazerSignUp);

playtimer.addEventListener("click",play_pomodoro_Timer);

pausetimer.addEventListener("click", pause_pomodoro_Timer)





