export const emailTemplates = {
  jobMatch: {
    subject: '🎯 New Job Match: {{jobTitle}} at {{company}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .job-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .match-score { font-size: 24px; font-weight: bold; color: #10b981; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Job Match Found!</h1>
            </div>
            <div class="content">
              <p>Hi {{userName}},</p>
              <p>We found a great job match for you based on your profile and preferences:</p>
              
              <div class="job-card">
                <h2>{{jobTitle}}</h2>
                <p><strong>Company:</strong> {{company}}</p>
                <p><strong>Location:</strong> {{location}}</p>
                <p><strong>Clearance Required:</strong> {{clearanceLevel}}</p>
                {{#if salary}}
                <p><strong>Salary Range:</strong> {{salary}}</p>
                {{/if}}
                <p class="match-score">Match Score: {{matchScore}}%</p>
                
                <h3>Why this is a good match:</h3>
                <ul>
                  {{#each matchReasons}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>
                
                <a href="{{actionUrl}}" class="button">View Job Details</a>
              </div>
              
              <p>Don't miss out on this opportunity - apply soon!</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you have job match notifications enabled.</p>
              <p><a href="{{unsubscribeUrl}}">Update notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  },
  
  applicationUpdate: {
    subject: '📋 Application Update: {{jobTitle}} at {{company}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .status-update { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .status-screening { background-color: #fbbf24; color: #78350f; }
            .status-interview { background-color: #3b82f6; color: white; }
            .status-offer { background-color: #10b981; color: white; }
            .status-rejected { background-color: #ef4444; color: white; }
            .timeline { margin: 20px 0; }
            .timeline-item { display: flex; align-items: center; margin: 10px 0; }
            .timeline-dot { width: 12px; height: 12px; border-radius: 50%; background-color: #3b82f6; margin-right: 10px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Status Update</h1>
            </div>
            <div class="content">
              <p>Hi {{userName}},</p>
              <p>There's been an update to your application:</p>
              
              <div class="status-update">
                <h2>{{jobTitle}}</h2>
                <p><strong>Company:</strong> {{company}}</p>
                <p><strong>Previous Status:</strong> {{previousStatus}}</p>
                <p><strong>New Status:</strong> <span class="status status-{{statusClass}}">{{newStatus}}</span></p>
                
                {{#if message}}
                <div style="background-color: #e0e7ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p><strong>Message from the employer:</strong></p>
                  <p>{{message}}</p>
                </div>
                {{/if}}
                
                {{#if nextSteps}}
                <h3>Next Steps:</h3>
                <div class="timeline">
                  {{#each nextSteps}}
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <p>{{this}}</p>
                  </div>
                  {{/each}}
                </div>
                {{/if}}
                
                <a href="{{actionUrl}}" class="button">View Application Details</a>
              </div>
            </div>
            <div class="footer">
              <p>You're receiving this because you have application update notifications enabled.</p>
              <p><a href="{{unsubscribeUrl}}">Update notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  },
  
  interviewReminder: {
    subject: '🗓️ Interview Reminder: {{jobTitle}} at {{company}} - {{date}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .interview-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .datetime { font-size: 20px; font-weight: bold; color: #1e40af; margin: 15px 0; }
            .info-item { margin: 10px 0; padding: 10px; background-color: #f3f4f6; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
            .tips { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Reminder</h1>
            </div>
            <div class="content">
              <p>Hi {{userName}},</p>
              <p>This is a reminder about your upcoming interview:</p>
              
              <div class="interview-card">
                <h2>{{jobTitle}}</h2>
                <p><strong>Company:</strong> {{company}}</p>
                <p class="datetime">📅 {{date}} at {{time}}</p>
                
                <div class="info-item">
                  <strong>Interview Type:</strong> {{interviewType}}
                </div>
                
                {{#if location}}
                <div class="info-item">
                  <strong>Location:</strong> {{location}}
                </div>
                {{/if}}
                
                {{#if interviewers}}
                <div class="info-item">
                  <strong>Interviewers:</strong> {{interviewers}}
                </div>
                {{/if}}
                
                <div class="tips">
                  <h3>📝 Quick Tips:</h3>
                  <ul>
                    <li>Review the job description and your application</li>
                    <li>Prepare questions to ask the interviewer</li>
                    <li>Test your tech setup if it's a virtual interview</li>
                    <li>Arrive 10-15 minutes early</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="{{calendarUrl}}" class="button">Add to Calendar</a>
                  <a href="{{applicationUrl}}" class="button">View Application</a>
                </div>
              </div>
              
              <p>Good luck with your interview!</p>
            </div>
            <div class="footer">
              <p>You're receiving this interview reminder based on your notification preferences.</p>
              <p><a href="{{unsubscribeUrl}}">Update notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  },
  
  newsletter: {
    subject: '📰 {{title}} - Cleared Advisory Group Newsletter',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 30px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .job-item { padding: 15px; border-left: 4px solid #3b82f6; margin: 10px 0; background-color: #f3f4f6; }
            .resource-item { padding: 10px; margin: 5px 0; background-color: #e0e7ff; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{title}}</h1>
              <p>{{subtitle}}</p>
            </div>
            <div class="content">
              {{#each sections}}
              <div class="section">
                <h2>{{this.title}}</h2>
                {{{this.content}}}
              </div>
              {{/each}}
              
              {{#if featuredJobs}}
              <div class="section">
                <h2>🔥 Featured Job Opportunities</h2>
                {{#each featuredJobs}}
                <div class="job-item">
                  <h3>{{this.title}}</h3>
                  <p><strong>{{this.company}}</strong> - {{this.location}}</p>
                  <p>Clearance: {{this.clearanceLevel}}</p>
                  <a href="{{this.url}}">View Job →</a>
                </div>
                {{/each}}
                <a href="{{jobBoardUrl}}" class="button">View All Jobs</a>
              </div>
              {{/if}}
              
              {{#if resources}}
              <div class="section">
                <h2>📚 Resources & Tips</h2>
                {{#each resources}}
                <div class="resource-item">
                  <a href="{{this.url}}">{{this.title}}</a>
                  <p>{{this.description}}</p>
                </div>
                {{/each}}
              </div>
              {{/if}}
            </div>
            <div class="footer">
              <p>You're receiving this newsletter because you subscribed to our updates.</p>
              <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Update Preferences</a></p>
              <p>© 2024 Cleared Advisory Group. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function compileTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = data[key.trim()]
    return value !== undefined ? String(value) : match
  })
}

export function compileHandlebarsTemplate(template: string, data: Record<string, any>): string {
  let result = template
  
  // Handle if statements
  result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    const value = data[condition.trim()]
    return value ? content : ''
  })
  
  // Handle each loops
  result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
    const array = data[arrayName.trim()]
    if (!Array.isArray(array)) return ''
    
    return array.map(item => {
      let itemContent = content
      if (typeof item === 'object') {
        Object.keys(item).forEach(key => {
          itemContent = itemContent.replace(new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g'), item[key])
        })
      } else {
        itemContent = itemContent.replace(/\{\{this\}\}/g, String(item))
      }
      return itemContent
    }).join('')
  })
  
  // Handle triple braces (no escaping)
  result = result.replace(/\{\{\{([^}]+)\}\}\}/g, (match, key) => {
    const value = data[key.trim()]
    return value !== undefined ? String(value) : match
  })
  
  // Handle regular variables
  result = compileTemplate(result, data)
  
  return result
}