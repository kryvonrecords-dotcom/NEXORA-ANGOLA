# Nexora News - Portal Completo & Aplicativo Android Nativo

**Nexora News** é uma plataforma moderna e completa de jornalismo digital que une um portal web de alto desempenho (React 18 + TypeScript + Tailwind CSS + Node.js/Express) com um aplicativo nativo para Android desenvolvido em Kotlin, arquitetura modular MVVM e compatibilidade total com o Android Studio.

---

## 📱 Estrutura do Projeto

```text
NEXORA_NEWS/
├── android/                             # Projeto Android Nativo (Android Studio)
│   ├── app/
│   │   ├── build.gradle                 # Configuração do módulo app (SDK 35, Jetpack, Coroutines, Glide, AdMob)
│   │   ├── proguard-rules.pro           # Regras de otimização R8/ProGuard
│   │   └── src/main/
│   │       ├── AndroidManifest.xml      # Manifesto com permissões e deep links
│   │       ├── java/com/nexoranews/app/ # Código-fonte Kotlin modular
│   │       │   ├── MainActivity.kt      # Activity principal com navegação por abas
│   │       │   ├── data/                # Repositórios, API Client, Cache Offline e Room/Preferences
│   │       │   └── ui/                  # Telas: Home, Notícias, Categorias, Detalhes, Salvos, Configurações
│   │       └── res/                     # Recursos: layouts XML, drawables vetoriais, mipmaps, temas e cores
│   ├── build.gradle                     # Gradle raiz do projeto Android
│   ├── settings.gradle                  # Definição de módulos e repositórios
│   ├── gradle.properties                # Configurações de JVM e AndroidX
│   ├── gradlew                          # Wrapper Gradle para Linux / macOS
│   ├── gradlew.bat                      # Wrapper Gradle para Windows
│   └── gradle/wrapper/                  # Arquivos de distribuição do Gradle 8.9
│
├── src/                                 # Aplicação Web & Painel Administrativo (React 18 + TypeScript)
│   ├── components/                      # Banners, Cartões de Notícia, Player, Modais, Notificações
│   ├── context/                         # Notificações Push, Tema (Claro/Escuro), Autenticação
│   ├── pages/                           # Home, Artigo, Busca, Categorias, Institucionais
│   │   └── Admin/                       # Painel Administrativo Completo (Editor, Estatísticas, Newsletter)
│   ├── services/                        # Camada de comunicação com a API REST
│   └── types.ts                         # Tipagens TypeScript do domínio
│
├── server/                              # Backend REST & Gerenciador de Banco de Dados Local
│   ├── routes.ts                        # Endpoints públicos e protegidos (Admin Auth, Notícias, Push)
│   └── db.ts                            # Persistência atômica com cache e categorização
│
├── public/                              # PWA Manifest, Service Worker, Ícones e Assets estáticos
├── .github/workflows/build-apk.yml      # CI/CD automatizado para compilar o APK no GitHub Actions
├── .env.example                         # Variáveis de ambiente configuráveis
├── package.json                         # Dependências e scripts do ecossistema Node.js
└── vite.config.ts                       # Configuração do empacotador Vite
```

---

## 🚀 Como Abrir e Compilar o APK no Android Studio

1. **Abrir no Android Studio**:
   - Abra o **Android Studio** (Koala, Iguana, Hedgehog ou superior).
   - Clique em **Open** e selecione a pasta **`android/`** (não a raiz do repositório, mas sim a pasta `android`).

2. **Configurar o JDK**:
   - Vá em **File > Settings** (ou **Preferences** no macOS) > **Build, Execution, Deployment > Build Tools > Gradle**.
   - Defina o **Gradle JDK** para **JDK 17** (ou superior).

3. **Sincronizar o Gradle**:
   - O Android Studio sincronizará as dependências automaticamente usando o `gradle-wrapper.properties` (Gradle 8.9 + AGP 8.5.2).

4. **Gerar o APK**:
   - No menu superior, clique em: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - O APK de depuração será gerado exatamente em:
     ```text
     android/app/build/outputs/apk/debug/app-debug.apk
     ```

5. **Compilar via Terminal (Opcional)**:
   - No Linux/macOS:
     ```bash
     cd android
     ./gradlew assembleDebug
     ```
   - No Windows:
     ```cmd
     cd android
     gradlew.bat assembleDebug
     ```

---

## 🌐 Como Executar a Aplicação Web & Backend

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Iniciar em Modo de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   O servidor estará disponível em: `http://localhost:3000`

3. **Compilar para Produção**:
   ```bash
   npm run build
   ```

---

## 🔒 Painel Administrativo

- Acesso pelo menu lateral ou pela URL `/admin`.
- Autenticação com credenciais protegidas via sessão e token.
- Permite publicação em tempo real, agendamento, envio seletivo de Notificações Push, gerenciamento de subscritores e controle editorial completo.

---

## 🤖 CI/CD com GitHub Actions

O arquivo `.github/workflows/build-apk.yml` compila automaticamente o aplicativo em cada push ou pull request, disponibilizando o arquivo `app-debug.apk` como artefato para download direto.
