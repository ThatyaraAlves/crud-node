const http = require("http");
const fs = require("fs");

const converter_filmes_para_string = (filme) => {
    return `<li>${filme.titulo} (${filme.diretor})</li>`;
}

const retornaFilmes = (callback) => {
    return fs.promises.readFile("./filmes.json")
            .then((buffer) => {
                const filmes = JSON.parse(buffer.toString());

                callback(filmes);
            })
            .catch((error) => {
                console.error(error);
                res.end("Erro ao encontrar o filme");
            });
}

const server = http.createServer((req, res) => {
    const {url, method} = req;

    console.log(url, method);

    if (url == "/") {
        if (method == "GET") {
            return retornaFilmes((filmes) => {
                res.setHeader('Content-Type', 'text/html;charset=utf-8');

                

                res.end(`
                    <h1>Lista de Filmes que eu gosto</h1>
                    <ul>
                        ${filmes.data.reduce((string_anterior, filme) => {
                            return string_anterior + converter_filmes_para_string(filme);
                        }, "")}
                    </ul>
                `);
                
            });
        } else if (method == "POST") {
            return retornaFilmes((filmes) => {
                req.on('data', novo_filme => {
                    novo_filme = JSON.parse(novo_filme);
                    novo_filme.id = filmes.ultimo_id + 1;
                    filmes.data.push(novo_filme);
                    filmes.ultimo_id = novo_filme.id;
                    
                    fs.promises.writeFile("./filmes.json", JSON.stringify(filmes));

                    res.end(`Posted ${JSON.stringify(novo_filme)}!`);
                });
            })
        } else if (method == "PUT") {
            return retornaFilmes((filmes) => {
                req.on('data', atualizar_filmes => {
                    atualizar_filmes = JSON.parse(atualizar_filmes);
                    
                    const id = atualizar_filmes.id;

                    const filme_index = filmes.data.findIndex((filme) => {
                        return filme.id == id;
                    })

                    filmes.data[filme_index].diretor = atualizar_filmes.diretor;
                    
                    fs.promises.writeFile("./filmes.json", JSON.stringify(filmes));

                    res.end(`Updated ${JSON.stringify(atualizar_filmes)}!`);
                });
            })
        } else if (method == "DELETE"){
            return retornaFilmes((filmes) => {
                req.on('data', atualizar_filmes => {
                    atualizar_filmes = JSON.parse(atualizar_filmes);
                    
                    const id = atualizar_filmes.id;

                   const filme_index = filmes.data.findIndex((filme) => {
                        return filme.id == id;
                    })

                    if (filme_index != -1) {
                        filmes.data.splice(filme_index, 1);
                        fs.promises.writeFile("./filmes.json", JSON.stringify(filmes));

                        return res.end(`Deleted ${JSON.stringify(atualizar_filmes)}!`);
                    }

                    res.writeHead(404);
                    res.end('Não foi possível encontrar o filme');
                });
            })
        }
    }

    res.writeHead(404);
    return res.end('PAGE NOT FOUND');
});

server.listen(8080, 'localhost', () => {
    const address = server.address();
    console.log(`Servidor rodando ${address.address}:${address.port}`);
});