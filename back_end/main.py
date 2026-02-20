from fastapi import FastAPI
from pydantic import BaseModel, Field
import sqlite3 as sql

app=FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn=sql.connect("wizard_tracker.db")
    conn.row_factory=sql.Row
    return conn

@app.get("/")
def home():
    return {"status": "Grimório Online", "msg": "Pronto para a sessão"}

class UsuarioCreate(BaseModel):
    nome: str=Field(min_length=3, max_length=20)
    senha: str=Field(min_length=6)

class TarefaCreate(BaseModel):
    usuario_id: int
    descricao: str
    tempo_est_min: int

@app.post("/tarefas")

def salvar_tarefa(tarefa: TarefaCreate):
    conn=get_db()
    cursor=conn.cursor()

    try:
        cursor.execute("INSERT INTO tarefas_concluidas (usuario_id, descricao, tempo_est_min) VALUES (?, ?, ?)",
                       (tarefa.usuario_id, tarefa.descricao, tarefa.tempo_est_min))
        conn.commit()

        return {"status": "sucesso", "mensagem": "Tarefa guardada com sucesso!"}
    except Exception as e:
        return {"status": "erro", "detalhe": str(e)}
    finally:
        conn.close()


@app.post("/usuarios")

def cadastro_usuarios(usuario: UsuarioCreate):
    conn=get_db()
    cursor=conn.cursor()

    try:
        cursor.execute("SELECT id FROM usuarios WHERE nome = ?", (usuario.nome,))
        usuario_existente=cursor.fetchone()

        if usuario_existente:
            return {"status": "erro", "mensagem": "Feiticeiro já registrado no grimório!"}
        
        cursor.execute("INSERT INTO usuarios (nome, senha_hash) VALUES (?, ?)", (usuario.nome,usuario.senha))
        conn.commit()
        return {"status": "Sucesso", "mensagem": f"Feiticeiro {usuario.nome} registrado"}
    except Exception as e:
        return {"status": "erro", "detalhe": str(e)}
    finally:
        conn.close()

@app.post("/login")

def logar_usuario(dadoslogin: UsuarioCreate):
    conn=get_db()
    cursor=conn.cursor()

    cursor.execute("SELECT * FROM usuarios WHERE nome = ?", (dadoslogin.nome,))
    resultado=cursor.fetchone()

    conn.close()

    if(resultado==None):
        return {"status": "Erro", "mensagem": "Feiticeiro não encontrado"}

    if dadoslogin.senha == resultado["senha_hash"]:
        return {"status": "sucesso", "msg": "Acesso liberado, feiticeiro!", "id_usuario": resultado["id"]}
    else:
        return {"status": "erro", "msg": "Senha incorreta!"}



@app.get("/usuarios")
def listar_usuarios():
    conn=get_db()
    cursor=conn.cursor()

    usuarios=cursor.execute("SELECT id, nome FROM usuarios").fetchall()
    conn.close()
    return {"usuarios": usuarios}

@app.delete("/usuarios/{usuario_id}")
def deletar_usuario(usuario_id: int):
    conn=get_db()
    cursor=conn.cursor()

    cursor.execute("DELETE FROM usuarios WHERE id = ?", (usuario_id,))
    conn.commit()
    conn.close()

    return {"status": "sucesso", "mensagem": f"Usuario{usuario_id} removido do grimório"}

@app.get("/tarefas_concluidas")

def listar_tarefas():
    conn=get_db()
    cursor=conn.cursor()

    tarefas_concluidas=cursor.execute("SELECT usuario_id, descricao FROM tarefas_concluidas ").fetchall()
    conn.close()
    return {"tarefas": tarefas_concluidas}



