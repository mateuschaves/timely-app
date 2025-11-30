#!/usr/bin/env python3
"""
Script para atualizar arquivos de estilo para usar tema dinâmico.
Substitui referências estáticas a colors.xxx por theme.xxx nos styled components.
"""

import re
import sys
from pathlib import Path

def update_styled_component_imports(content):
    """Remove colors e shadows dos imports, mantém spacing, borderRadius, typography"""
    # Remove colors e shadows dos imports
    content = re.sub(
        r"import\s*\{\s*([^}]*)\s*\}\s*from\s*['\"]@/theme['\"]",
        lambda m: f"import {{ {', '.join([x.strip() for x in m.group(1).split(',') if 'colors' not in x.strip() and 'shadows' not in x.strip()])} }} from '@/theme'",
        content
    )
    return content

def update_colors_to_theme(content):
    """Substitui ${colors.xxx} por ${({ theme }) => theme.xxx}"""
    # Padrão para ${colors.xxx.yyy}
    pattern = r'\$\{colors\.(\w+(?:\.\w+)*)\}'
    
    def replace_func(match):
        path = match.group(1)
        return f'${{({{\ theme\ }}) => theme.{path}}}'
    
    content = re.sub(pattern, replace_func, content)
    
    # Para casos dentro de props como props.variant === 'outline' ? colors.primary : ...
    # Substitui colors.xxx por props.theme.xxx ou theme.xxx dependendo do contexto
    content = re.sub(r'colors\.(\w+(?:\.\w+)*)', lambda m: f'props.theme.{m.group(1)}', content)
    
    return content

def add_theme_type_to_styled_component(line):
    """Adiciona <{ theme: any }> aos styled components que não têm tipo mas usam theme"""
    if re.search(r'styled\.\w+<', line) and 'theme' not in line:
        # Já tem tipo, pode precisar adicionar theme
        if 'theme: any' not in line:
            line = re.sub(r'(styled\.\w+)<([^>]+)>', r'\1<\2 & { theme: any }>', line)
    elif re.search(r'styled\.\w+`', line):
        # Não tem tipo, adiciona
        line = re.sub(r'(styled\.\w+)`', r'\1<{ theme: any }>`', line)
    return line

def process_file(file_path):
    """Processa um arquivo de estilo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Atualiza imports
        content = update_styled_component_imports(content)
        
        # 2. Substitui colors.xxx por theme.xxx
        content = update_colors_to_theme(content)
        
        # 3. Substitui shadows.xxx por theme.shadows.xxx
        content = re.sub(r'\$\{shadows\.(\w+\.\w+)\}', r'${({ theme }) => theme.shadows.\1}', content)
        
        # 4. Adiciona tipos de tema aos styled components quando necessário
        lines = content.split('\n')
        updated_lines = []
        for line in lines:
            if 'styled.' in line and 'theme' in line and '<' not in line.split('styled.')[1].split('`')[0]:
                updated_lines.append(add_theme_type_to_styled_component(line))
            else:
                updated_lines.append(line)
        content = '\n'.join(updated_lines)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")
        return False

if __name__ == '__main__':
    # Lista de arquivos para atualizar
    files_to_update = [
        'src/features/auth/LoginScreen/styles.ts',
        'src/features/auth/TermsScreen/styles.ts',
        'src/features/history/HistoryScreen/styles.ts',
        'src/features/history/EditEventScreen/styles.ts',
        'src/features/profile/LanguageScreen/styles.ts',
        'src/features/profile/EditNameScreen/styles.ts',
        'src/features/profile/WorkSettingsScreen/styles.ts',
        'src/features/profile/PrivacyAndSecurityScreen/styles.ts',
        'src/features/profile/DeleteAccountScreen/styles.ts',
    ]
    
    base_path = Path(__file__).parent.parent
    updated_count = 0
    
    for file_path in files_to_update:
        full_path = base_path / file_path
        if full_path.exists():
            if process_file(full_path):
                print(f"✓ Atualizado: {file_path}")
                updated_count += 1
            else:
                print(f"- Sem mudanças: {file_path}")
        else:
            print(f"✗ Não encontrado: {file_path}")
    
    print(f"\n{updated_count} arquivos atualizados.")

