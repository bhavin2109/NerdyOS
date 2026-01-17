/**
 * NerdyOS Configuration Parser
 * Parses Hyprland-style configuration files
 */

// Token types for lexer
const TOKEN_TYPES = {
    IDENTIFIER: 'IDENTIFIER',
    EQUALS: 'EQUALS',
    VALUE: 'VALUE',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    COMMA: 'COMMA',
    NEWLINE: 'NEWLINE',
    COMMENT: 'COMMENT',
    VARIABLE: 'VARIABLE',
    SOURCE: 'SOURCE',
};

/**
 * Tokenize a configuration file
 * @param {string} input - Raw config file content
 * @returns {Array} Array of tokens
 */
function tokenize(input) {
    const tokens = [];
    let current = 0;
    const lines = input.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        let line = lines[lineNum].trim();

        // Skip empty lines
        if (!line) continue;

        // Handle comments
        if (line.startsWith('#')) {
            tokens.push({ type: TOKEN_TYPES.COMMENT, value: line, line: lineNum + 1 });
            continue;
        }

        // Remove inline comments
        const commentIndex = line.indexOf('#');
        if (commentIndex > 0) {
            line = line.substring(0, commentIndex).trim();
        }

        // Handle variable definitions: $var = value
        if (line.startsWith('$')) {
            const match = line.match(/^\$(\w+)\s*=\s*(.+)$/);
            if (match) {
                tokens.push({
                    type: TOKEN_TYPES.VARIABLE,
                    name: match[1],
                    value: match[2].trim(),
                    line: lineNum + 1,
                });
                continue;
            }
        }

        // Handle source directive
        if (line.startsWith('source')) {
            const match = line.match(/^source\s*=\s*(.+)$/);
            if (match) {
                tokens.push({
                    type: TOKEN_TYPES.SOURCE,
                    value: match[1].trim(),
                    line: lineNum + 1,
                });
                continue;
            }
        }

        // Handle section start: section {
        const sectionMatch = line.match(/^(\w+)\s*\{$/);
        if (sectionMatch) {
            tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: sectionMatch[1], line: lineNum + 1 });
            tokens.push({ type: TOKEN_TYPES.LBRACE, line: lineNum + 1 });
            continue;
        }

        // Handle section end: }
        if (line === '}') {
            tokens.push({ type: TOKEN_TYPES.RBRACE, line: lineNum + 1 });
            continue;
        }

        // Handle submap definitions
        if (line.startsWith('submap')) {
            const match = line.match(/^submap\s*=\s*(.+)$/);
            if (match) {
                tokens.push({
                    type: 'SUBMAP',
                    value: match[1].trim(),
                    line: lineNum + 1,
                });
                continue;
            }
        }

        // Handle key = value or key = value1, value2, ...
        const keyValueMatch = line.match(/^([\w.]+)\s*=\s*(.+)$/);
        if (keyValueMatch) {
            tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: keyValueMatch[1], line: lineNum + 1 });
            tokens.push({ type: TOKEN_TYPES.EQUALS, line: lineNum + 1 });
            tokens.push({ type: TOKEN_TYPES.VALUE, value: keyValueMatch[2].trim(), line: lineNum + 1 });
            continue;
        }

        // Handle bind = ... (keybind entries)
        const bindMatch = line.match(/^(bind[m]?)\s*=\s*(.+)$/);
        if (bindMatch) {
            tokens.push({ type: 'BIND', bindType: bindMatch[1], value: bindMatch[2].trim(), line: lineNum + 1 });
            continue;
        }

        // Handle windowrule entries
        const windowRuleMatch = line.match(/^(windowrule(?:v2)?)\s*=\s*(.+)$/);
        if (windowRuleMatch) {
            tokens.push({
                type: 'WINDOWRULE',
                ruleType: windowRuleMatch[1],
                value: windowRuleMatch[2].trim(),
                line: lineNum + 1,
            });
            continue;
        }

        // Handle layerrule entries
        const layerRuleMatch = line.match(/^(layerrule)\s*=\s*(.+)$/);
        if (layerRuleMatch) {
            tokens.push({
                type: 'LAYERRULE',
                value: layerRuleMatch[2].trim(),
                line: lineNum + 1,
            });
            continue;
        }
    }

    return tokens;
}

/**
 * Parse color value (rgba, rgb, hex, or variable reference)
 * @param {string} value - Color string
 * @param {Object} variables - Variable definitions
 * @returns {string} Parsed color value
 */
function parseColor(value, variables = {}) {
    // Handle variable reference
    if (value.startsWith('$')) {
        const varName = value.substring(1);
        return variables[varName] || value;
    }

    // Handle rgba(rrggbbaa) format
    if (value.startsWith('rgba(') && value.endsWith(')')) {
        const hex = value.slice(5, -1);
        if (hex.length === 8) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            const a = parseInt(hex.slice(6, 8), 16) / 255;
            return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
        }
    }

    // Handle rgb(rrggbb) format
    if (value.startsWith('rgb(') && value.endsWith(')')) {
        const hex = value.slice(4, -1);
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    // Handle hex format
    if (value.startsWith('#')) {
        return value;
    }

    return value;
}

/**
 * Parse a value into appropriate type
 * @param {string} value - Raw string value
 * @param {Object} variables - Variable definitions
 * @returns {any} Parsed value
 */
function parseValue(value, variables = {}) {
    // Handle variable substitution
    let processed = value;
    for (const [varName, varValue] of Object.entries(variables)) {
        processed = processed.replace(new RegExp(`\\$${varName}\\b`, 'g'), varValue);
    }

    // Boolean
    if (processed === 'true' || processed === 'yes' || processed === 'on') return true;
    if (processed === 'false' || processed === 'no' || processed === 'off') return false;

    // Number
    if (/^-?\d+$/.test(processed)) return parseInt(processed, 10);
    if (/^-?\d+\.\d+$/.test(processed)) return parseFloat(processed);

    // Color with gradient (e.g., "rgba(xxx) rgba(yyy) 45deg")
    if (processed.includes('rgba(') || processed.includes('rgb(')) {
        const parts = processed.split(/\s+/);
        if (parts.length >= 2) {
            const colors = parts.filter(p => p.startsWith('rgba(') || p.startsWith('rgb(') || p.startsWith('$'));
            const angle = parts.find(p => p.endsWith('deg'));
            if (colors.length > 1 && angle) {
                return {
                    type: 'gradient',
                    colors: colors.map(c => parseColor(c, variables)),
                    angle: parseInt(angle, 10),
                };
            }
        }
        return parseColor(processed, variables);
    }

    // Array (comma-separated)
    if (processed.includes(',') && !processed.includes('(')) {
        return processed.split(',').map(v => parseValue(v.trim(), variables));
    }

    return processed;
}

/**
 * Parse keybind entry
 * @param {string} bindValue - Raw bind string "MODS, KEY, ACTION, ARGS"
 * @param {Object} variables - Variable definitions
 * @returns {Object} Parsed keybind object
 */
function parseKeybind(bindValue, variables = {}) {
    // Substitute variables
    let processed = bindValue;
    for (const [varName, varValue] of Object.entries(variables)) {
        processed = processed.replace(new RegExp(`\\$${varName}\\b`, 'g'), varValue);
    }

    const parts = processed.split(',').map(p => p.trim());

    if (parts.length < 3) {
        console.warn('Invalid keybind format:', bindValue);
        return null;
    }

    const [modifiers, key, action, ...args] = parts;

    return {
        modifiers: modifiers.split(/\s+/).filter(m => m),
        key: key,
        action: action,
        args: args.length > 0 ? args.join(', ') : undefined,
        raw: bindValue,
    };
}

/**
 * Parse window rule
 * @param {string} ruleValue - Raw rule string
 * @param {string} ruleType - 'windowrule' or 'windowrulev2'
 * @returns {Object} Parsed rule object
 */
function parseWindowRule(ruleValue, ruleType) {
    const parts = ruleValue.split(',').map(p => p.trim());

    if (ruleType === 'windowrule') {
        // Format: rule, match
        if (parts.length >= 2) {
            const [rule, ...matchParts] = parts;
            return {
                type: 'windowrule',
                rule: parseRuleAction(rule),
                match: matchParts.join(', '),
            };
        }
    } else {
        // windowrulev2: rule, condition1, condition2, ...
        if (parts.length >= 2) {
            const [rule, ...conditions] = parts;
            return {
                type: 'windowrulev2',
                rule: parseRuleAction(rule),
                conditions: conditions.map(parseRuleCondition),
            };
        }
    }

    return null;
}

/**
 * Parse a rule action (e.g., "size 800 600")
 */
function parseRuleAction(action) {
    const parts = action.split(/\s+/);
    const name = parts[0];
    const args = parts.slice(1);

    return {
        name,
        args: args.length > 0 ? args : undefined,
    };
}

/**
 * Parse a rule condition (e.g., "class:^(terminal)$")
 */
function parseRuleCondition(condition) {
    const colonIndex = condition.indexOf(':');
    if (colonIndex > 0) {
        return {
            type: condition.substring(0, colonIndex),
            value: condition.substring(colonIndex + 1),
        };
    }
    return { type: 'unknown', value: condition };
}

/**
 * Parse tokens into configuration object
 * @param {Array} tokens - Token array from tokenize()
 * @returns {Object} Parsed configuration
 */
function parse(tokens) {
    const config = {
        variables: {},
        sections: {},
        binds: [],
        windowRules: [],
        layerRules: [],
        sources: [],
    };

    let currentSection = null;
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];

        switch (token.type) {
            case TOKEN_TYPES.VARIABLE:
                config.variables[token.name] = token.value;
                break;

            case TOKEN_TYPES.SOURCE:
                config.sources.push(token.value);
                break;

            case TOKEN_TYPES.IDENTIFIER:
                // Check if this starts a section
                if (tokens[i + 1]?.type === TOKEN_TYPES.LBRACE) {
                    currentSection = token.value;
                    config.sections[currentSection] = config.sections[currentSection] || {};
                    i++; // Skip the LBRACE
                } else if (tokens[i + 1]?.type === TOKEN_TYPES.EQUALS) {
                    // Key-value pair
                    const key = token.value;
                    i += 2; // Skip EQUALS
                    const valueToken = tokens[i];
                    if (valueToken?.type === TOKEN_TYPES.VALUE) {
                        const value = parseValue(valueToken.value, config.variables);
                        if (currentSection) {
                            // Nested key (e.g., col.active_border)
                            if (key.includes('.')) {
                                const [parent, child] = key.split('.');
                                config.sections[currentSection][parent] = config.sections[currentSection][parent] || {};
                                config.sections[currentSection][parent][child] = value;
                            } else {
                                config.sections[currentSection][key] = value;
                            }
                        } else {
                            config[key] = value;
                        }
                    }
                }
                break;

            case TOKEN_TYPES.RBRACE:
                currentSection = null;
                break;

            case 'BIND':
                const bind = parseKeybind(token.value, config.variables);
                if (bind) {
                    bind.type = token.bindType; // 'bind' or 'bindm'
                    config.binds.push(bind);
                }
                break;

            case 'WINDOWRULE':
                const rule = parseWindowRule(token.value, token.ruleType);
                if (rule) {
                    config.windowRules.push(rule);
                }
                break;

            case 'LAYERRULE':
                const parts = token.value.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    config.layerRules.push({
                        rule: parts[0],
                        layer: parts[1],
                    });
                }
                break;

            case 'SUBMAP':
                // TODO: Handle submap mode switching
                break;
        }

        i++;
    }

    return config;
}

/**
 * Parse a configuration file string
 * @param {string} content - Raw configuration file content
 * @returns {Object} Parsed configuration object
 */
export function parseConfig(content) {
    const tokens = tokenize(content);
    return parse(tokens);
}

/**
 * Merge multiple configs (for source includes)
 * @param {Object} base - Base configuration
 * @param {Object} override - Override configuration
 * @returns {Object} Merged configuration
 */
export function mergeConfigs(base, override) {
    const merged = { ...base };

    // Merge sections
    for (const [section, values] of Object.entries(override.sections || {})) {
        merged.sections[section] = {
            ...(merged.sections[section] || {}),
            ...values,
        };
    }

    // Merge variables
    merged.variables = {
        ...(merged.variables || {}),
        ...(override.variables || {}),
    };

    // Concatenate arrays
    merged.binds = [...(merged.binds || []), ...(override.binds || [])];
    merged.windowRules = [...(merged.windowRules || []), ...(override.windowRules || [])];
    merged.layerRules = [...(merged.layerRules || []), ...(override.layerRules || [])];
    merged.sources = [...(merged.sources || []), ...(override.sources || [])];

    return merged;
}

/**
 * Get a value from config using dot notation
 * @param {Object} config - Parsed configuration
 * @param {string} path - Dot-separated path (e.g., "general.gaps_in")
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Configuration value
 */
export function getConfigValue(config, path, defaultValue = undefined) {
    const parts = path.split('.');
    let current = config;

    for (const part of parts) {
        if (current === undefined || current === null) {
            return defaultValue;
        }
        // Check sections first
        if (current.sections && current.sections[part] !== undefined) {
            current = current.sections[part];
        } else if (current[part] !== undefined) {
            current = current[part];
        } else {
            return defaultValue;
        }
    }

    return current;
}

export default {
    parseConfig,
    mergeConfigs,
    getConfigValue,
};
