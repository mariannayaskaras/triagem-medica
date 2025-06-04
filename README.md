# 🩺 Triagem Médica

[![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-blue)](#)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)](LICENSE)
[![Deploy - Vercel](https://img.shields.io/badge/build-passing-brightgreen?logo=vercel)](https://triagem-medica.vercel.app)

Aplicação web para simulação de triagem médica. O usuário informa sintomas, e o sistema classifica a gravidade e recomenda o tipo de atendimento adequado (UBS, UPA ou Hospital), além de exibir unidades próximas no mapa.

🔗 **Acesse aqui:** [https://triagem-medica.vercel.app](https://triagem-medica.vercel.app)

---

## 📚 Sumário

- [🚀 Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🏗️ Arquitetura do Projeto](#️-arquitetura-do-projeto)
- [📌 Aviso](#-aviso)
- [✉️ Contato](#️-contato)
- [📄 Licença](#-licença)

---

## 🚀 Funcionalidades

- Classificação de sintomas em baixa, média ou alta severidade.
- Recomendações baseadas na gravidade.
- Exibição de unidades de saúde próximas via Google Maps.
- Botão de emergência em casos graves.
- Armazenamento de dados da triagem no Supabase.

---

## 🛠️ Tecnologias

- **React + TypeScript**
- **Vite**
- **Tailwind CSS**
- **Supabase**
- **Google Maps API**
- **Lucide Icons**

---

## 🏗️ Arquitetura do Projeto

A estrutura básica do projeto é modular e desacoplada para facilitar manutenção e escalabilidade:


- **Gerenciamento de estado**: Simples e local (useState/useContext).
- **API**: Supabase para persistência de dados e autenticação.
- **Mapas**: Google Maps renderizado com markers dinâmicos.
- **Estilo**: Tailwind CSS para agilidade no desenvolvimento responsivo.

---

## 📌 Aviso

Este sistema é uma simulação e **não substitui atendimento médico profissional**.

---

## ✉️ Contato

Desenvolvido por **Marianna Yaskara**  
📧 [marianna.yaskara@live.com](mailto:marianna.yaskara@live.com)  
🔗 [triagem-medica.vercel.app](https://triagem-medica.vercel.app)

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
