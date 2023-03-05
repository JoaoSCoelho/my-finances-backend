# my-finances-backend
 
 # Como rodar
Eu recomendo o uso do `yarn` para rodar e testar o projeto, caso não o tenha instalado em sua máquina, siga os passos de [instalação do yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable).

 ## 1. Crie o arquivo .env conforme o padrão em [.env.example](.env.example)
 ## 2. Na pasta raíz do projeto, execute
 * Para rodar o servidor em modo de desenvolvimento, com re-run automático quando arquivos forem alterados:
 ```powershell
  yarn dev 
 ```
 * Para criar uma build do projeto em JavaScript:
 ```powershell
  yarn build
 ```
 * Para executar a build do projeto:
 ```powershell
  yarn start
 ```
 * Para executar os testes automatizados funcionais
 ```powershell
  yarn test:functional
 ```