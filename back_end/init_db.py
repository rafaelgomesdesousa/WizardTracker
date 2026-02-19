import sqlite3 as sql

def criar_banco():

    conexao=sql.connect('wizard_tracker.db')
    cursor=conexao.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS usuarios(
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   nome TEXT NOT NULL,
                   senha_hash TEXT NOT NULL
                   )''')
    
    cursor.execute(''' CREATE TABLE IF NOT EXISTS tarefas_concluidas(
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   usuario_id INTEGER NOT NULL,
                   descricao TEXT NOT NULL,
                   tempo_est_min INTEGER,
                   data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                   FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                   )
                   ''')
    conexao.commit()
    conexao.close()


if __name__ == "__main__":
    criar_banco()
    