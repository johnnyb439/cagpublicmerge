export interface InterviewQuestion {
  question: string;
  answer: string;
}

export const interviewQuestions: Record<string, InterviewQuestion[]> = {
  helpdesk: [
    {
      question: "Walk me through your methodology when a colleague can't access network resources. What's your step-by-step approach?",
      answer: "I would follow a systematic troubleshooting approach: First, I'd verify the user's credentials and check if their account is active in Active Directory. Next, I'd confirm network connectivity by having them ping the gateway and DNS server. Then I'd check if other users are experiencing similar issues to determine if it's isolated or widespread. I'd verify their network adapter settings, ensure they're on the correct VLAN, and check for any recent system updates. Finally, I'd review event logs for any authentication errors and escalate to network team if needed, documenting all steps in the ticket."
    },
    {
      question: "Can you explain directory services and demonstrate how you'd help someone who forgot their login credentials?",
      answer: "Directory services like Active Directory centralize user authentication and resource management. When helping someone who forgot their credentials, I'd first verify their identity through security questions or manager approval. Then I'd access Active Directory Users and Computers, locate their account, and reset their password to a temporary one. I'd ensure 'User must change password at next logon' is checked, unlock the account if needed, and verify no security policies are violated. I'd then securely communicate the temporary password and guide them through the password change process while documenting the interaction."
    },
    {
      question: "A team member mentions their workstation has become sluggish. What's your diagnostic process?",
      answer: "I'd start by checking Task Manager to identify high CPU, memory, or disk usage. I'd look for unnecessary startup programs and disable them, check for malware using our enterprise antivirus, and verify available disk space (ensuring at least 15% free). I'd review recent software installations or updates that might cause conflicts, check Event Viewer for system errors, run Windows updates, and perform disk cleanup and defragmentation if needed. If the issue persists, I'd check for failing hardware using built-in diagnostics and consider reimaging if software issues can't be resolved."
    },
    {
      question: "Compare and contrast different Windows file system formats. In what scenarios would each be most appropriate?",
      answer: "NTFS is the modern standard, supporting file permissions, encryption, compression, and files over 4GB - ideal for system drives and corporate environments. FAT32 is legacy but universal, limited to 4GB files, best for USB drives that need cross-platform compatibility. exFAT bridges the gap, supporting large files without NTFS complexity, perfect for external drives and flash storage. ReFS is newer, designed for server resilience with automatic error correction, used in Storage Spaces. For corporate workstations, NTFS is essential for security. For removable media shared with non-Windows systems, FAT32 or exFAT is appropriate."
    },
    {
      question: "You receive several urgent requests simultaneously. How do you prioritize and manage your workload?",
      answer: "I prioritize based on business impact and affected user count. First, I'd handle any system-wide outages affecting multiple users. Then security incidents like potential breaches or malware. Next, issues preventing critical business functions (executives, customer-facing roles). I'd use our ticketing system to track all requests, communicate realistic timelines to users, and escalate when necessary. For equally urgent issues, I'd apply first-in-first-out while keeping users informed. I'd also look for common issues that might be resolved together and leverage team members for assistance when overwhelmed."
    },
    {
      question: "Tell me about remote access solutions and how you'd assist someone having trouble connecting from home.",
      answer: "Common remote access solutions include VPN (client-based or SSL), Remote Desktop/RDP, and cloud solutions like Citrix or VMware Horizon. For VPN troubleshooting, I'd verify their internet connection first, ensure VPN client is updated, check credentials and any MFA requirements, verify firewall isn't blocking VPN ports, test with different networks to rule out ISP issues, and check if their VPN profile or certificates need updating. For RDP issues, I'd confirm the target computer is powered on and connected, verify RDP is enabled and firewall rules allow it, check their home router isn't blocking port 3389, and potentially set up a TeamViewer or similar session for immediate support while resolving the primary connection method."
    },
    {
      question: "What's your approach to preparing new hardware for employee use in a corporate environment?",
      answer: "I follow a standardized deployment process: First, verify hardware specifications meet user requirements, update BIOS/firmware to latest stable versions, then image the machine using our standard corporate image via SCCM or similar tool. Post-imaging, I join it to the domain, apply appropriate Group Policies, install role-specific software, configure email and productivity apps, set up network drives and printers, enable BitLocker encryption, install and update antivirus definitions, create a local admin account for IT support, run Windows updates, test all functionality including peripherals, document the asset in inventory system, and finally deliver with a quick orientation on any new features or changes from their previous system."
    },
    {
      question: "How do you handle sensitive data when decommissioning equipment? What security measures are essential?",
      answer: "Data security during decommissioning is critical. For hard drives, I use DBAN (Darik's Boot and Nuke) or similar tools to perform multiple-pass overwrites meeting DoD 5220.22-M standards. For SSDs, I use manufacturer secure erase utilities since traditional wiping is less effective. If drives contained highly sensitive data or are faulty, physical destruction via approved shredding service is required. I also check for data in unexpected places: BIOS settings, printer memory, copier hard drives. All devices are logged with serial numbers, and certificates of destruction are obtained. For donated or resold equipment, I verify data removal with recovery tools. Finally, I update asset management systems and maintain audit trails for compliance."
    },
    {
      question: "From a support standpoint, what key changes should technicians know about recent Windows versions?",
      answer: "Key Windows 11 changes include: new hardware requirements (TPM 2.0, Secure Boot), centered taskbar and Start menu requiring user adjustment, Teams integration replacing Skype, new Widgets panel that may impact performance, virtual desktops improvements, and new Microsoft Store. From support perspective: many older devices can't upgrade, requiring hardware refresh planning; new settings app locations need relearning; some legacy apps may have compatibility issues; driver support is still maturing; and Windows Update behavior has changed. I'd also note improved security with mandatory BitLocker, enhanced Windows Hello, and Microsoft Defender improvements. Training users on UI changes and preparing for hardware upgrades are essential support considerations."
    },
    {
      question: "A colleague encounters a critical system error with a blue screen. Walk me through your troubleshooting process.",
      answer: "For BSOD troubleshooting, I'd first document the stop code and any listed driver files. If the system bootloops, I'd boot into Safe Mode or use installation media for recovery options. My process includes: checking Event Viewer for critical errors before the crash, analyzing minidump files with WinDbg or BlueScreenView to identify the faulting module, reviewing recently installed updates or drivers (common culprits), running memory diagnostic to check for RAM issues, checking disk health with chkdsk and S.M.A.R.T. data, verifying system file integrity with sfc /scannow and DISM, updating or rolling back problematic drivers, checking for overheating or hardware issues, and potentially performing a clean boot to isolate software conflicts. If hardware-related, I'd test with minimal configuration or replacement parts."
    }
  ]
};