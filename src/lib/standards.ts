import { RULES_REGISTRY, STANDARDS_REGISTRY } from '../constants/standards';
import { RuleDefinition, StandardsCoverageSummary } from '../types';

export function getCoverageSummary(): StandardsCoverageSummary {
  const implementedStandards = STANDARDS_REGISTRY.filter((standard) => standard.status === 'implemented').length;
  const partialStandards = STANDARDS_REGISTRY.filter((standard) => standard.status === 'partial').length;
  const plannedStandards = STANDARDS_REGISTRY.filter((standard) => standard.status === 'planned').length;

  const implementedRules = RULES_REGISTRY.filter((rule) => rule.status === 'implemented').length;
  const partialRules = RULES_REGISTRY.filter((rule) => rule.status === 'partial').length;
  const plannedRules = RULES_REGISTRY.filter((rule) => rule.status === 'planned').length;

  return {
    totalStandards: STANDARDS_REGISTRY.length,
    implementedStandards,
    partialStandards,
    plannedStandards,
    totalRules: RULES_REGISTRY.length,
    implementedRules,
    partialRules,
    plannedRules,
  };
}

export function getRulesForModule(moduleId: string): RuleDefinition[] {
  return RULES_REGISTRY.filter((rule) => rule.moduleIds.includes(moduleId));
}

export function getPriorityStandards(priority: 'foundation' | 'core' | 'extended') {
  return STANDARDS_REGISTRY.filter((standard) => standard.priority === priority);
}
