# 📚 Documentação Swagger/OpenAPI - Baby Diary API

## 🎯 Visão Geral

O Baby Diary API utiliza **Swagger/OpenAPI 3.0** para documentação completa e interativa da API. A documentação está disponível em tempo real e permite testar endpoints diretamente no navegador.

## 🔗 URLs de Acesso

- **Desenvolvimento**: http://localhost:3000/api/docs
- **Produção**: https://api.babydiary.com/api/docs

## 🛠️ Configuração

### Dependências Instaladas

```json
{
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0",
  "@types/swagger-jsdoc": "^6.0.4",
  "@types/swagger-ui-express": "^4.1.6"
}
```

### Arquivo de Configuração

```typescript
// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Baby Diary API',
      version: '1.0.0',
      description: 'API completa para o sistema Baby Diary',
      contact: {
        name: 'Baby Diary Team',
        email: 'support@babydiary.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.babydiary.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Schemas definidos aqui
      }
    }
  },
  apis: ['./src/routes/*.ts']
};
```

## 📝 Como Documentar Endpoints

### Exemplo Básico

```typescript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 */
```

### Exemplo com Parâmetros

```typescript
/**
 * @swagger
 * /api/user/babies/{id}:
 *   get:
 *     summary: Buscar bebê por ID
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do bebê
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *           enum: [activities, memories, milestones]
 *         description: Relacionamentos para incluir
 *     responses:
 *       200:
 *         description: Bebê encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Baby'
 *       404:
 *         description: Bebê não encontrado
 */
```

## 🏗️ Schemas Definidos

### User Schema

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
```

### Baby Schema

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Baby:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         birthDate:
 *           type: string
 *           format: date
 *         photoUrl:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */
```

## 🔐 Autenticação

### Bearer Token

```typescript
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT obtido através do login
 */
```

### Uso em Endpoints

```typescript
/**
 * @swagger
 * /api/user/me:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obter perfil do usuário
 */
```

## 🏷️ Tags Organizacionais

```typescript
/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Endpoints de autenticação e autorização
 *   - name: Usuário
 *     description: Endpoints específicos do usuário
 *   - name: Admin
 *     description: Endpoints administrativos
 *   - name: Bebês
 *     description: Gestão de bebês
 *   - name: Atividades
 *     description: Registro de atividades
 *   - name: IA
 *     description: Funcionalidades de inteligência artificial
 *   - name: Pagamentos
 *     description: Integração com Stripe
 */
```

## 🧪 Testes Interativos

### Como Usar

1. Acesse http://localhost:3000/api/docs
2. Faça login para obter um token JWT
3. Clique no botão "Authorize" no topo
4. Insira o token no formato: `Bearer <seu-token>`
5. Teste os endpoints diretamente na interface

### Exemplo de Token

```bash
# Login para obter token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"123456"}'

# Usar token na documentação
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Códigos de Resposta

### Padrão de Resposta

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: object
 */
```

### Códigos HTTP Comuns

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autorizado
- **403**: Proibido
- **404**: Não encontrado
- **409**: Conflito (dados duplicados)
- **500**: Erro interno do servidor

## 🔧 Configuração Avançada

### Personalização da Interface

```typescript
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Baby Diary API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true
  }
}));
```

### Variáveis de Ambiente

```typescript
const servers = [
  {
    url: process.env.NODE_ENV === 'production' 
      ? 'https://api.babydiary.com' 
      : 'http://localhost:3000',
    description: process.env.NODE_ENV === 'production' 
      ? 'Servidor de Produção' 
      : 'Servidor de Desenvolvimento'
  }
];
```

## 🚀 Deploy

### Produção

```bash
# Build do projeto
npm run build

# Verificar se a documentação está funcionando
curl http://localhost:3000/api/docs

# Deploy
npm start
```

### Docker

```dockerfile
# A documentação estará disponível em /api/docs
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoramento

### Health Check da Documentação

```bash
# Verificar se a documentação está acessível
curl -I http://localhost:3000/api/docs

# Verificar especificação OpenAPI
curl http://localhost:3000/api/docs/swagger.json
```

### Logs

```bash
# Logs de acesso à documentação
npm run dev | grep "GET /api/docs"
```

## 🎯 Próximos Passos

1. **Adicionar mais exemplos** de uso
2. **Implementar testes automatizados** baseados na documentação
3. **Integrar com CI/CD** para validação automática
4. **Adicionar autenticação OAuth2** para produção
5. **Criar SDKs** baseados na especificação OpenAPI

---

**A documentação Swagger/OpenAPI torna a API mais acessível e fácil de usar! 🚀** 