#!/usr/bin/env node

/**
 * UI Regression Test Suite for Workflow Builder
 * 
 * This script generates action items by testing UI interactions
 * Run with: node test-ui-regression.js
 */

import { spawn } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

class UIRegressionTester {
  constructor() {
    this.actionItems = []
    this.testResults = []
    this.components = [
      'WorkflowOptimizer',
      'ModalWorkflowFlowController', 
      'MultiLaneEditor',
      'WorkflowThumbnail',
      'WorkflowBuilder',
      'LaneSelectModal',
      'LaneEditorModal',
      'InstrumentPalette'
    ]
  }

  // Test categories for each component
  getTestCategories() {
    return {
      'WorkflowOptimizer': [
        'FAB Button Functionality',
        'Theme Switching', 
        'Optimization Process',
        'Tab Navigation',
        'Modal Opening/Closing',
        'Empty State Handling'
      ],
      'ModalWorkflowFlowController': [
        'Step Navigation',
        'Back Button Behavior',
        'Modal Width Calculation',
        'Add Lane Functionality', 
        'Delete Lane Functionality',
        'Drag and Drop Reordering',
        'Close Modal Behavior'
      ],
      'MultiLaneEditor': [
        'Lane Grid Layout',
        'Add Lane Button',
        'Lane Click Navigation',
        'Delete Lane Confirmation',
        'Lane Statistics Display',
        'Empty State Handling',
        'Responsive Behavior'
      ],
      'WorkflowThumbnail': [
        'Workflow Click Handler',
        'Lane Click Handler', 
        'Edit Button Functionality',
        'Priority Badge Display',
        'Metrics Calculation',
        'Liquid Handler Connections',
        'Hover Effects'
      ],
      'WorkflowBuilder': [
        'Drag and Drop from Palette',
        'Step Reordering',
        'Lane Name Editing',
        'Workflow Name Editing',
        'Step Removal',
        'Lane Addition',
        'Lane Removal',
        'Empty Lane Handling'
      ],
      'LaneSelectModal': [
        'Lane Selection',
        'Empty Workflow Handling',
        'Add First Lane Button',
        'Lane Statistics Display'
      ],
      'LaneEditorModal': [
        'Step Addition',
        'Step Editing',
        'Step Removal',
        'Step Reordering',
        'Duration Editing',
        'Task Selection',
        'Save/Cancel Behavior'
      ],
      'InstrumentPalette': [
        'Instrument Filtering',
        'Drag Initiation',
        'Task Selection',
        'Custom Task Creation',
        'Icon Selection',
        'Search Functionality'
      ]
    }
  }

  // Critical user journeys to test
  getCriticalJourneys() {
    return [
      {
        name: 'Create New Workflow',
        steps: [
          'Click Create Workflow button',
          'Add workflow name',
          'Add first lane',
          'Add steps to lane',
          'Save workflow'
        ]
      },
      {
        name: 'Edit Existing Workflow',
        steps: [
          'Click Edit Workflow button on thumbnail',
          'Navigate to multi-lane editor',
          'Click individual lane',
          'Edit lane steps',
          'Return to workflow view'
        ]
      },
      {
        name: 'Add Lane to Workflow',
        steps: [
          'Open workflow editor',
          'Click Add Lane button',
          'Verify new lane appears',
          'Add steps to new lane',
          'Verify lane statistics update'
        ]
      },
      {
        name: 'Drag and Drop Workflow',
        steps: [
          'Open instrument palette',
          'Drag instrument to lane',
          'Verify step appears',
          'Edit step details',
          'Reorder steps within lane'
        ]
      },
      {
        name: 'Optimize Workflow',
        steps: [
          'Create workflows with steps',
          'Click Optimize Schedule',
          'Verify loading state',
          'Check results tab',
          'Verify metrics display'
        ]
      }
    ]
  }

  // Analyze component files for potential issues
  analyzeComponent(componentName) {
    const issues = []
    
    try {
      const filePath = this.getComponentPath(componentName)
      const content = readFileSync(filePath, 'utf8')
      
      // Check for common issues
      issues.push(...this.checkEventHandlers(content, componentName))
      issues.push(...this.checkStateManagement(content, componentName))
      issues.push(...this.checkElementPlusUsage(content, componentName))
      issues.push(...this.checkTypescript(content, componentName))
      issues.push(...this.checkEmptyStates(content, componentName))
      
    } catch (error) {
      issues.push({
        component: componentName,
        category: 'File Access',
        issue: `Could not read component file: ${error.message}`,
        priority: 'High',
        actionItem: `Verify ${componentName} file exists and is accessible`
      })
    }
    
    return issues
  }

  checkEventHandlers(content, componentName) {
    const issues = []
    
    // Check for event handlers that might not be implemented
    const eventHandlerRegex = /@click="([^"]+)"/g
    const handlerRegex = /const\s+(\w+)\s*=/g
    
    const clickHandlers = [...content.matchAll(eventHandlerRegex)].map(match => match[1])
    const definedHandlers = [...content.matchAll(handlerRegex)].map(match => match[1])
    
    clickHandlers.forEach(handler => {
      if (!definedHandlers.includes(handler) && !handler.includes('$emit') && !handler.includes('.')) {
        issues.push({
          component: componentName,
          category: 'Event Handlers',
          issue: `Click handler "${handler}" not found in component`,
          priority: 'High',
          actionItem: `Implement or fix handler: ${handler}`
        })
      }
    })
    
    return issues
  }

  checkStateManagement(content, componentName) {
    const issues = []
    
    // Check for reactive state usage
    if (content.includes('workflows.value') && !content.includes('useWorkflowState')) {
      issues.push({
        component: componentName,
        category: 'State Management',
        issue: 'Direct workflows.value access without useWorkflowState composable',
        priority: 'Medium',
        actionItem: 'Ensure proper state management through composables'
      })
    }
    
    // Check for computed properties that might be undefined
    const computedRegex = /const\s+(\w+)\s*=\s*computed\(/g
    const computedProps = [...content.matchAll(computedRegex)].map(match => match[1])
    
    computedProps.forEach(prop => {
      if (content.includes(`${prop}.value?.`) || content.includes(`${prop}?.`)) {
        // Good - using optional chaining
      } else if (content.includes(`${prop}.value.`) && !content.includes(`if (${prop}.value)`)) {
        issues.push({
          component: componentName,
          category: 'Null Safety',
          issue: `Computed property "${prop}" may be accessed without null check`,
          priority: 'Medium',
          actionItem: `Add null safety checks for computed property: ${prop}`
        })
      }
    })
    
    return issues
  }

  checkElementPlusUsage(content, componentName) {
    const issues = []
    
    // Check for non-Element Plus components that should be replaced
    const customButtons = content.match(/class="[^"]*btn[^"]*"/g) || []
    if (customButtons.length > 0 && !content.includes('el-button')) {
      issues.push({
        component: componentName,
        category: 'Element Plus Compliance',
        issue: 'Using custom buttons instead of el-button',
        priority: 'Low',
        actionItem: 'Replace custom buttons with el-button components'
      })
    }
    
    // Check for custom modals
    if (content.includes('class="modal') && !content.includes('el-dialog')) {
      issues.push({
        component: componentName,
        category: 'Element Plus Compliance',
        issue: 'Using custom modal instead of el-dialog',
        priority: 'Medium',
        actionItem: 'Replace custom modal with el-dialog'
      })
    }
    
    return issues
  }

  checkTypescript(content, componentName) {
    const issues = []
    
    // Check for any type assertions
    if (content.includes(' as ') && !content.includes(' as const')) {
      issues.push({
        component: componentName,
        category: 'TypeScript',
        issue: 'Using type assertions which may hide type errors',
        priority: 'Low',
        actionItem: 'Review type assertions for proper typing'
      })
    }
    
    // Check for untyped event emitters
    if (content.includes('$emit(') && !content.includes('defineEmits<')) {
      issues.push({
        component: componentName,
        category: 'TypeScript',
        issue: 'Event emitters not properly typed',
        priority: 'Medium',
        actionItem: 'Add proper TypeScript types to event emitters'
      })
    }
    
    return issues
  }

  checkEmptyStates(content, componentName) {
    const issues = []
    
    // Check for arrays that might be empty without handling
    if (content.includes('.length') && !content.includes('v-if') && !content.includes('v-else')) {
      issues.push({
        component: componentName,
        category: 'Empty States',
        issue: 'Array length used without empty state handling',
        priority: 'Medium',
        actionItem: 'Add empty state handling for arrays'
      })
    }
    
    return issues
  }

  getComponentPath(componentName) {
    const basePath = 'src/components'
    const paths = {
      'WorkflowOptimizer': `${basePath}/demos/WorkflowOptimizer.vue`,
      'ModalWorkflowFlowController': `${basePath}/workflow/ModalWorkflowFlowController.vue`,
      'MultiLaneEditor': `${basePath}/workflow/MultiLaneEditor.vue`,
      'WorkflowThumbnail': `${basePath}/workflow/WorkflowThumbnail.vue`,
      'WorkflowBuilder': `${basePath}/workflow/WorkflowBuilder.vue`,
      'LaneSelectModal': `${basePath}/workflow/LaneSelectModal.vue`, 
      'LaneEditorModal': `${basePath}/workflow/LaneEditorModal.vue`,
      'InstrumentPalette': `${basePath}/workflow/InstrumentPalette.vue`
    }
    
    return resolve(paths[componentName])
  }

  // Generate specific test cases for known issues
  generateKnownIssueTests() {
    return [
      {
        component: 'ModalWorkflowFlowController',
        category: 'Add Lane Functionality',
        issue: 'Add Lane button not working in multi-lane editor',
        priority: 'High',
        actionItem: 'Fix handleAddLane function to properly add lanes to workflow state',
        testSteps: [
          'Open workflow editor',
          'Click Add Lane button',
          'Verify new lane appears in UI',
          'Check if lane count updates',
          'Verify lane can be edited'
        ]
      },
      {
        component: 'WorkflowBuilder',
        category: 'Empty State Handling', 
        issue: 'Empty lane hint removed but drop zone behavior unclear',
        priority: 'Medium',
        actionItem: 'Verify drop zone still works without visual hint',
        testSteps: [
          'Create empty lane',
          'Drag instrument from palette',
          'Verify drop zone accepts instrument',
          'Check if step appears in lane'
        ]
      },
      {
        component: 'WorkflowOptimizer',
        category: 'Modal Navigation',
        issue: 'Back to Overview button was removed, verify outside click works',
        priority: 'Medium', 
        actionItem: 'Test modal closing behavior with outside clicks',
        testSteps: [
          'Open workflow modal',
          'Navigate to multi-lane editor',
          'Click outside modal',
          'Verify modal closes properly'
        ]
      }
    ]
  }

  // Run the full test suite
  async runTests() {
    console.log('🧪 Starting UI Regression Test Suite...\n')
    
    // Analyze each component
    for (const component of this.components) {
      console.log(`📋 Analyzing ${component}...`)
      const issues = this.analyzeComponent(component)
      this.actionItems.push(...issues)
    }
    
    // Add known issues
    this.actionItems.push(...this.generateKnownIssueTests())
    
    // Generate report
    this.generateReport()
    
    console.log(`✅ Analysis complete! Found ${this.actionItems.length} action items.`)
    console.log('📄 Report saved to: ui-regression-report.md')
  }

  generateReport() {
    const report = this.buildMarkdownReport()
    writeFileSync('ui-regression-report.md', report)
  }

  buildMarkdownReport() {
    const now = new Date().toISOString()
    
    let report = `# UI Regression Test Report\n\n`
    report += `**Generated:** ${now}\n\n`
    report += `**Total Action Items:** ${this.actionItems.length}\n\n`
    
    // Summary by priority
    const byPriority = this.groupBy(this.actionItems, 'priority')
    report += `## Summary by Priority\n\n`
    Object.entries(byPriority).forEach(([priority, items]) => {
      report += `- **${priority}:** ${items.length} items\n`
    })
    report += `\n`
    
    // Summary by component
    const byComponent = this.groupBy(this.actionItems, 'component')
    report += `## Summary by Component\n\n`
    Object.entries(byComponent).forEach(([component, items]) => {
      report += `- **${component}:** ${items.length} items\n`
    })
    report += `\n`
    
    // Detailed action items
    report += `## Detailed Action Items\n\n`
    
    Object.entries(byComponent).forEach(([component, items]) => {
      report += `### ${component}\n\n`
      
      const sortedItems = items.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      
      sortedItems.forEach((item, index) => {
        report += `#### ${index + 1}. ${item.category}\n\n`
        report += `**Priority:** ${item.priority}\n\n`
        report += `**Issue:** ${item.issue}\n\n`
        report += `**Action Item:** ${item.actionItem}\n\n`
        
        if (item.testSteps) {
          report += `**Test Steps:**\n`
          item.testSteps.forEach(step => {
            report += `- ${step}\n`
          })
          report += `\n`
        }
        
        report += `---\n\n`
      })
    })
    
    // Critical User Journeys
    report += `## Critical User Journeys to Test\n\n`
    this.getCriticalJourneys().forEach((journey, index) => {
      report += `### ${index + 1}. ${journey.name}\n\n`
      journey.steps.forEach(step => {
        report += `- ${step}\n`
      })
      report += `\n`
    })
    
    return report
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = groups[item[key]] || []
      group.push(item)
      groups[item[key]] = group
      return groups
    }, {})
  }
}

// Run the tests
const tester = new UIRegressionTester()
tester.runTests().catch(console.error)