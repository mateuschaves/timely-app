import Foundation

// Forward declarations para os tipos do React Native
// Esses tipos serão definidos pelo bridge Objective-C
typealias RCTPromiseResolveBlock = @convention(block) (Any?) -> Void
typealias RCTPromiseRejectBlock = @convention(block) (String, String, Error?) -> Void

@objc(TokenStorage)
@objcMembers
class TokenStorage: NSObject {
    
    private static let appGroupID = "group.com.wazowsky.timelyapp"
    private static let userDefaultsKey = "timely_token"
    private static let languageKey = "timely_language"
    
    // Retorna o UserDefaults do App Group
    private static var sharedUserDefaults: UserDefaults? {
        return UserDefaults(suiteName: appGroupID)
    }
    
    // Salva o token no UserDefaults do App Group para que o App Intent possa acessar
    @objc
    func saveToken(_ token: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("💾 TokenStorage.saveToken chamado com token de \(token.count) caracteres")
        
        guard let sharedDefaults = TokenStorage.sharedUserDefaults else {
            print("❌ Erro: Não foi possível acessar o App Group '\(TokenStorage.appGroupID)'")
            reject("APP_GROUP_ERROR", "Não foi possível acessar o App Group", nil)
            return
        }
        
        sharedDefaults.set(token, forKey: TokenStorage.userDefaultsKey)
        sharedDefaults.synchronize()
        
        // Verifica se foi salvo corretamente
        if let savedToken = sharedDefaults.string(forKey: TokenStorage.userDefaultsKey) {
            print("✅ Token salvo com sucesso no App Group '\(TokenStorage.appGroupID)' com a chave '\(TokenStorage.userDefaultsKey)'")
            print("📝 Token salvo tem \(savedToken.count) caracteres")
            resolve(nil)
        } else {
            print("❌ Erro: Token não foi salvo corretamente")
            reject("SAVE_ERROR", "Token não foi salvo corretamente", nil)
        }
    }
    
    // Remove o token do UserDefaults do App Group
    @objc
    func removeToken(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = TokenStorage.sharedUserDefaults else {
            print("❌ Erro: Não foi possível acessar o App Group '\(TokenStorage.appGroupID)'")
            reject("APP_GROUP_ERROR", "Não foi possível acessar o App Group", nil)
            return
        }
        
        sharedDefaults.removeObject(forKey: TokenStorage.userDefaultsKey)
        sharedDefaults.synchronize()
        resolve(nil)
    }
    
    // Recupera o token do UserDefaults do App Group
    @objc
    func getToken(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = TokenStorage.sharedUserDefaults else {
            print("❌ Erro: Não foi possível acessar o App Group '\(TokenStorage.appGroupID)'")
            resolve(nil)
            return
        }
        
        if let token = sharedDefaults.string(forKey: TokenStorage.userDefaultsKey) {
            resolve(token)
        } else {
            resolve(nil)
        }
    }
    
    // Salva o idioma no UserDefaults do App Group para que o App Intent possa acessar
    @objc
    func saveLanguage(_ language: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("💾 TokenStorage.saveLanguage chamado com idioma: \(language)")
        
        guard let sharedDefaults = TokenStorage.sharedUserDefaults else {
            print("❌ Erro: Não foi possível acessar o App Group '\(TokenStorage.appGroupID)'")
            reject("APP_GROUP_ERROR", "Não foi possível acessar o App Group", nil)
            return
        }
        
        sharedDefaults.set(language, forKey: TokenStorage.languageKey)
        sharedDefaults.synchronize()
        
        print("✅ Idioma salvo com sucesso no App Group '\(TokenStorage.appGroupID)' com a chave '\(TokenStorage.languageKey)': \(language)")
        resolve(nil)
    }
    
    // Recupera o idioma do UserDefaults do App Group
    @objc
    func getLanguage(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = TokenStorage.sharedUserDefaults else {
            print("❌ Erro: Não foi possível acessar o App Group '\(TokenStorage.appGroupID)'")
            resolve(nil)
            return
        }
        
        if let language = sharedDefaults.string(forKey: TokenStorage.languageKey) {
            resolve(language)
        } else {
            resolve(nil)
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}

