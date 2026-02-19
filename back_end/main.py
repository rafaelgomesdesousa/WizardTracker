import sqlite3 as sql
from flask import Flask

sql_usuarios=''' 
    CREATE TABLE IF NOT EXISTS Usuarios (
    ID_Usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Senha TEXT NOT NULL
    );
'''

sql_notes='''
    CREATE TABLE IF NOT EXISTS Notas (
    ID_Nota INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Dono INTEGER,
    Conteudo TEXT,
    Data TEXT,
    FOREIGN KEY (Id_Dono) REFERENCES Usuarios (Id_Usuario)
    );
'''
 
