import AppIntents
import Foundation
import UserNotifications

@available(iOS 16.0, *)
struct ClockIntent: AppIntent {
    static var title: LocalizedStringResource = "Bater Ponto"
    static var description = IntentDescription("Registra entrada ou saída do trabalho automaticamente")
    static var openAppWhenRun: Bool = false
    
    // Parâmetros de descoberta para aparecer nas sugestões
    static var suggestedInvocationPhrase: String? = "Bater ponto"
    static var parameterSummary: some ParameterSummary {
        Summary("Bater Ponto")
    }
    
    func perform() async throws -> some ProvidesDialog {
        // Recupera o token do UserDefaults (onde AsyncStorage armazena no iOS)
        // Debug: lista todas as chaves do UserDefaults para identificar o formato
        #if DEBUG
        let allKeys = UserDefaults.standard.dictionaryRepresentation().keys
        let tokenRelatedKeys = allKeys.filter { $0.lowercased().contains("token") || $0.lowercased().contains("timely") }
        print("🔍 Chaves relacionadas a token/timely encontradas: \(Array(tokenRelatedKeys))")
        #endif
        
        guard let token = ClockIntentHelper.getToken() else {
            // Debug: mostra todas as chaves disponíveis para ajudar no debug
            #if DEBUG
            let allDefaults = UserDefaults.standard.dictionaryRepresentation()
            print("❌ Token não encontrado. Chaves disponíveis no UserDefaults:")
            for (key, value) in allDefaults.sorted(by: { $0.key < $1.key }) {
                if let stringValue = value as? String, stringValue.count > 20 {
                    print("  - \(key): \(stringValue.prefix(50))...")
                }
            }
            #endif
            throw ClockIntentError.noToken
        }
        
        // Bate o ponto - o backend determina automaticamente se é entrada ou saída
        print("🚀 Iniciando chamada para bater ponto...")
        do {
            let response = try await ClockIntentHelper.clock(token: token)
            print("✅ Resposta da API recebida: \(response)")
            
            // Extrai a ação (clock-in ou clock-out) da resposta
            let action = response["action"] as? String ?? "ponto"
            let actionText = action == "clock-in" ? "entrada" : "saída"
            
            // Envia uma notificação local
            await ClockIntentHelper.sendNotification(action: actionText)
            
            return .result(dialog: "Ponto de \(actionText) registrado com sucesso!")
        } catch ClockIntentError.apiError(let message) {
            print("❌ Erro na API: \(message)")
            throw ClockIntentError.apiError(message: message)
        } catch {
            print("❌ Erro desconhecido: \(error.localizedDescription)")
            print("❌ Tipo do erro: \(type(of: error))")
            throw ClockIntentError.unknownError(error.localizedDescription)
        }
    }
}

@available(iOS 16.0, *)
enum ClockIntentError: Error, CustomLocalizedStringResourceConvertible {
    case noToken
    case invalidURL
    case apiError(message: String)
    case unknownError(String)
    
    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .noToken:
            return "Token de autenticação não encontrado. Por favor, faça login no app."
        case .invalidURL:
            return "URL inválida"
        case .apiError(let message):
            return LocalizedStringResource(stringLiteral: "Erro na API: \(message)")
        case .unknownError(let message):
            return LocalizedStringResource(stringLiteral: "Erro desconhecido: \(message)")
        }
    }
}

@available(iOS 16.0, *)
struct ClockIntentHelper {
    private static let apiBaseURL = "https://timely-api-yfoa.onrender.com"
    private static let tokenKey = "@timely:token"
    
    // Recupera o token do App Group UserDefaults
    static func getToken() -> String? {
        let appGroupID = "group.com.wazowsky.timelyapp"
        let primaryKey = "timely_token"
        
        print("🔍 Tentando acessar o App Group '\(appGroupID)'...")
        
        // Primeiro, tenta buscar do App Group UserDefaults
        guard let sharedDefaults = UserDefaults(suiteName: appGroupID) else {
            print("❌ ERRO CRÍTICO: Não foi possível acessar o App Group '\(appGroupID)'")
            print("❌ Isso geralmente significa que:")
            print("   1. O App Group não está configurado no Xcode (Signing & Capabilities)")
            print("   2. O App Group não está no Apple Developer Portal")
            print("   3. O nome do App Group está incorreto")
            return nil
        }
        
        print("✅ App Group acessado com sucesso")
        
        // Lista todas as chaves disponíveis no App Group (para debug)
        #if DEBUG
        let allKeys = sharedDefaults.dictionaryRepresentation().keys
        print("📋 Chaves disponíveis no App Group: \(Array(allKeys))")
        #endif
        
        if let token = sharedDefaults.string(forKey: primaryKey), !token.isEmpty {
            print("📝 Valor encontrado para a chave '\(primaryKey)': \(token.prefix(50))... (tamanho: \(token.count))")
            
            // Verifica se parece um JWT token (contém pontos e tem tamanho razoável)
            if token.contains(".") && token.count > 50 {
                print("✅ Token encontrado e válido no App Group '\(appGroupID)' com a chave '\(primaryKey)'")
                return token
            } else {
                print("⚠️ Valor encontrado no App Group mas não parece ser um JWT válido")
                print("⚠️ Valor: \(token.prefix(100))")
            }
        } else {
            print("❌ Nenhum valor encontrado no App Group '\(appGroupID)' com a chave '\(primaryKey)'")
            print("❌ Certifique-se de que você fez login novamente após implementar o módulo nativo")
        }
        
        return nil
    }
    
    // Faz a chamada para bater o ponto
    // O backend determina automaticamente se é entrada ou saída baseado no último evento
    static func clock(token: String) async throws -> [String: Any] {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        let now = formatter.string(from: Date())
        
        print("📅 Hora formatada: \(now)")
        
        guard let url = URL(string: "\(apiBaseURL)/clockin") else {
            print("❌ URL inválida: \(apiBaseURL)/clockin")
            throw ClockIntentError.invalidURL
        }
        
        print("🌐 URL da API: \(url.absoluteString)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        print("🔑 Token usado (primeiros 20 caracteres): \(token.prefix(20))...")
        
        // Body da requisição - apenas a hora (localização removida para evitar travamentos)
        let body: [String: Any] = [
            "hour": now
        ]
        
        print("📦 Body da requisição: \(body)")
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        print("📤 Enviando requisição para a API...")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        print("📥 Resposta recebida")
        
        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ Resposta não é HTTPURLResponse")
            throw ClockIntentError.apiError(message: "Resposta inválida do servidor")
        }
        
        print("📊 Status code: \(httpResponse.statusCode)")
        print("📋 Headers: \(httpResponse.allHeaderFields)")
        
        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Erro desconhecido"
            print("❌ Erro HTTP \(httpResponse.statusCode): \(errorMessage)")
            throw ClockIntentError.apiError(message: "Erro \(httpResponse.statusCode): \(errorMessage)")
        }
        
        let responseString = String(data: data, encoding: .utf8) ?? "Não foi possível decodificar"
        print("📄 Resposta completa: \(responseString)")
        
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            print("❌ Não foi possível parsear JSON da resposta")
            throw ClockIntentError.apiError(message: "Resposta inválida")
        }
        
        print("✅ JSON parseado com sucesso: \(json)")
        return json
    }
    
    // Envia uma notificação local quando o ponto é registrado
    static func sendNotification(action: String) async {
        let center = UNUserNotificationCenter.current()
        
        // Verifica se tem permissão para notificações
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .authorized else {
            print("⚠️ Permissão de notificação não concedida, pulando notificação")
            return
        }
        
        // Cria o conteúdo da notificação
        let content = UNMutableNotificationContent()
        content.title = "Ponto Registrado"
        content.body = "Ponto de \(action) registrado com sucesso!"
        content.sound = .default
        content.badge = nil
        
        // Cria a requisição (trigger imediato)
        let request = UNNotificationRequest(
            identifier: "clock-\(UUID().uuidString)",
            content: content,
            trigger: nil // nil = dispara imediatamente
        )
        
        // Envia a notificação
        do {
            try await center.add(request)
            print("✅ Notificação enviada: Ponto de \(action) registrado")
        } catch {
            print("❌ Erro ao enviar notificação: \(error.localizedDescription)")
        }
    }
}

// App Shortcuts Provider para registrar o App Intent e torná-lo visível nas sugestões
@available(iOS 16.0, *)
struct ClockShortcutsProvider: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: ClockIntent(),
            phrases: [
                "Bater ponto no \(.applicationName)",
                "Registrar ponto no \(.applicationName)",
                "Marcar ponto no \(.applicationName)"
            ],
            shortTitle: "Bater Ponto",
            systemImageName: "clock.fill"
        )
    }
    
    static var shortcutTileColor: ShortcutTileColor {
        .blue
    }
}


