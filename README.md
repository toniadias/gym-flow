
# GymFlow 

GymFlow é uma aplicação Full Stack para **monitoramento de treinos**, focada em acompanhar métricas de performance, evolução física e recuperação dos usuários.  
O sistema permite registrar, organizar e analisar treinos de forma estruturada, oferecendo uma experiência moderna e intuitiva.

---

## Status
 **Em Andamento:** Como o projeto está em desenvolvimento, as instruções abaixo podem sofrer alterações frequentes.

---

## Stack Tecnológica

| Tecnologia | Descrição | Documentação |
|------------|----------|---------------|
| Node.js | Runtime backend | https://nodejs.org/ |
| React | Frontend UI | https://react.dev/ |
| Prisma ORM | ORM para banco de dados | https://www.prisma.io/docs |
| Playwright | Automação de testes API | https://playwright.dev/ |
| JavaScript | Linguagem principal | https://developer.mozilla.org/docs/Web/JavaScript |

---

## Estrutura do Projeto

```
gym-flow/
├── backend/
│   ├── server.js
│   ├── fixRole.js
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   │
│   ├── .env
│   ├── swagger.yaml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   └── App.js
│   │
│   ├── public/
│   └── package.json
│
└── tests/
    ├── api/
    │   ├── auth/
    │   │   └── login.spec.js
    │   │
    │   ├── equipamentos/
    │   │   ├── equipamentos.post.spec.js
    │   │   └── equipamentos.get.spec.js
    │   │	
    │   ├── security/
    │   │   └── auth-rbac.spec.js
    │   │
    │   ├── treinos/
    │   │   ├── treinos.get.spec.js
    │   │   ├── treinos.patch.spec.js
    │   │   └── treinos.post.spec.js
    │   │
    │   └── usuarios/
    │       ├── usuarios.delete.spec.js
    │       ├── usuarios.get.spec.js
    │       ├── usuarios.post.spec.js
    │       └── usuarios.put.spec.js
    │   
    ├── utils/
    │   ├── auth.helper.js
    │   ├── global.js
    │   └── request.helper.js
    │
    ├── support/
    │   └── auth.js
    │
    ├── playwright.config.js
    └── package.json
```

---

## Configuração de Ambiente

```env
BASE_URL=http://localhost:3000
```

---

## Instruções de Execução

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Testes (Playwright)
```bash
cd tests
npx playwright test
npx playwright test --ui
```

---

## Relatórios
```bash
npx playwright show-report playwright-report
```

---

## CI/CD - GitHub Actions

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd tests
          npm install

      - name: Run tests
        run: |
          cd tests
          npx playwright install --with-deps
          npx playwright test

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/playwright-report
```

---

## Padrões de Qualidade

- Testes baseados em contrato (Swagger/OpenAPI)
- Cobertura de cenários positivos e negativos
- Validação de status HTTP e payload
- Foco em regressão e confiabilidade

---

## Sobre a autora

Projeto desenvolvido por **Tonia Dias**, Analista de QA com experiência em testes manuais e automatizados, atuando com Cypress, Playwright, JavaScript e testes de API.  
Foco em qualidade de software, automação de testes e melhoria contínua de processos dentro de times ágeis.

🔗 LinkedIn: https://www.linkedin.com/in/toniadias
💻 GitHub: https://github.com/toniadias

Este projeto foi desenvolvido como parte da mentoria do Julio de Lima.
