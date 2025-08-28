import { NextRequest, NextResponse } from 'next/server'

interface InterviewQuestion {
  question: string
  answer: string
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
}

// Minimal essential questions for each category
const questionData: Record<string, InterviewQuestion[]> = {
  helpdesk: [
    {
      question: "A user forgot their password and needs to access their computer. What steps do you take to help them?",
      answer: "**Identity Verification:**\n• Ask security questions or check employee ID\n• Verify caller through established protocols\n\n**Password Reset:**\n• Access Active Directory portal\n• Generate temporary password\n• Provide securely and require immediate change\n\n**Follow-up:**\n• Document in ticket system\n• Show self-service password reset portal"
    },
    {
      question: "A user says their computer is running very slowly. What are your first steps?",
      answer: "**Quick Diagnostics:**\n• Open Task Manager (Ctrl+Shift+Esc)\n• Check CPU, memory, disk usage\n• Identify resource-heavy programs\n\n**Immediate Solutions:**\n• Restart if uptime > 7 days\n• Close unnecessary programs\n• Run Disk Cleanup\n• Check for malware"
    },
    {
      question: "How do you help a user connect to a network printer?",
      answer: "**Information Needed:**\n• Printer IP address or name\n• Network vs shared printer type\n\n**Setup Process:**\n• Settings > Printers & scanners\n• Add printer (auto-detect or manual IP)\n• Install drivers\n• Print test page\n\n**Troubleshooting:**\n• Verify network connectivity\n• Check user permissions\n• Clear print spooler if needed"
    }
  ],
  isp: [
    {
      question: "A customer is moving and wants to transfer their internet service. What information do you need?",
      answer: "**Information Needed:**\n• New address (verify service availability)\n• Moving date\n• Current account details\n• Equipment preferences\n\n**Process Steps:**\n• Check service availability at new location\n• Schedule technician installation\n• Review any plan/billing changes\n• Provide transfer confirmation\n\n**Follow-up:**\n• Set service disconnect at old address\n• Confirm installation day expectations"
    },
    {
      question: "Customer reports slow internet speeds. How do you troubleshoot?",
      answer: "**Speed Testing:**\n• Run speed test from multiple devices\n• Test wired vs wireless speeds\n• Compare to subscribed plan speeds\n\n**Common Fixes:**\n• Restart modem/router\n• Check for background downloads\n• Update network drivers\n• Optimize WiFi channel\n\n**Escalation:**\n• Schedule technician if hardware issue\n• Check for area outages\n• Review account for throttling"
    }
  ],
  osp: [
    {
      question: "You discover widespread copper theft affecting your aerial plant. How do you respond?",
      answer: "**Immediate Response:**\n• Secure damaged areas for safety\n• Document theft with photos/GPS\n• Contact law enforcement\n• Deploy temporary cables for critical services\n\n**Prevention Measures:**\n• Install hardened security enclosures\n• Deploy cable alarm systems\n• Use armored cable in high-theft areas\n• Add motion cameras and lighting\n\n**Long-term Strategy:**\n• Work with scrap yards on suspicious sales\n• Implement neighborhood watch programs\n• Consider fiber transition (no scrap value)"
    }
  ],
  fiber: [
    {
      question: "How do you properly clean and inspect fiber optic connectors?",
      answer: "**Cleaning Process:**\n• Use lint-free wipes and isopropyl alcohol\n• Clean in one direction only\n• Never touch fiber end face\n• Use compressed air to remove debris\n\n**Inspection:**\n• Use fiber microscope (400x magnification)\n• Check for scratches, pits, or contamination\n• Verify proper polish and geometry\n• Document findings\n\n**Standards:**\n• Must meet IEC 61300-3-35 cleanliness standards\n• Re-clean if any defects found"
    }
  ],
  network: [
    {
      question: "How do you troubleshoot a VLAN configuration issue?",
      answer: "**Initial Checks:**\n• Verify VLAN exists in VLAN database\n• Check port assignments (access/trunk)\n• Validate IP addressing scheme\n\n**Testing:**\n• Use show vlan brief command\n• Check trunk links with show interfaces trunk\n• Verify spanning tree operation\n• Test connectivity between devices\n\n**Common Issues:**\n• VLAN not propagated via VTP\n• Incorrect trunk configuration\n• Native VLAN mismatches"
    }
  ],
  systems: [
    {
      question: "How do you troubleshoot Exchange email delivery issues?",
      answer: "**Initial Assessment:**\n• Check message tracking logs\n• Verify transport rules aren't blocking\n• Review queue status\n\n**Common Checks:**\n• DNS MX record resolution\n• Connector configuration\n• Anti-spam/anti-malware settings\n• Storage space availability\n\n**Tools:**\n• Exchange Management Console\n• Message tracking\n• Queue viewer\n• Transport logs"
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  const category = params.category.toLowerCase()
  
  if (!questionData[category]) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  // Return random 15 questions from the category
  const questions = questionData[category]
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  
  return NextResponse.json({ 
    questions: shuffled.slice(0, 15),
    total: questions.length 
  })
}