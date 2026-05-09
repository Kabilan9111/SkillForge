const db = require('../config/database');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456');

class ProjectInvite {
    static async initTables() {
        await db.run('CREATE TABLE IF NOT EXISTS project_contributors (project_id INTEGER, user_id INTEGER, status TEXT DEFAULT "pending", PRIMARY KEY (project_id, user_id))');
        await db.run('CREATE TABLE IF NOT EXISTS project_invites (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, project_id INTEGER, invited_by INTEGER, token TEXT UNIQUE, status TEXT DEFAULT "pending", created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
    }

    static async addContributor(projectId, userId, status = 'pending') {
        const result = await db.run(
            'INSERT OR REPLACE INTO project_contributors (project_id, user_id, status) VALUES (?, ?, ?)',
            [projectId, userId, status]
        );
        return result;
    }

    static async getContributors(projectId) {
        return await db.all('SELECT * FROM project_contributors WHERE project_id = ?', [projectId]);
    }

    static async processPendingInvitesForEmail(email, userId) {
        const pending = await db.all('SELECT * FROM project_invites WHERE email = ? AND status = "pending"', [email]);
        if (pending && pending.length > 0) {
            for (const invite of pending) {
                await this.addContributor(invite.project_id, userId, 'accepted');
                await this.updateInviteStatus(invite.token, 'accepted');
            }
        }
    }

    static async getInviteByToken(token) {
        return await db.get('SELECT * FROM project_invites WHERE token = ?', [token]);
    }

    static async updateInviteStatus(token, status) {
        return await db.run('UPDATE project_invites SET status = ? WHERE token = ?', [status, token]);
    }

    static async createInvite(email, projectId, invitedBy, inviterName, projectName) {
        const existing = await db.get('SELECT id FROM project_invites WHERE email = ? AND project_id = ? AND status = "pending"', [email, projectId]);
        if (existing) return null;

        const projCount = await db.get('SELECT COUNT(*) as count FROM project_invites WHERE project_id = ?', [projectId]);
        if (projCount && projCount.count >= 10) return null;

        const dayCount = await db.get('SELECT COUNT(*) as count FROM project_invites WHERE date(created_at) = date("now")');
        if (dayCount && dayCount.count >= 100) return null;

        const token = crypto.randomUUID();
        
        await db.run(
            'INSERT INTO project_invites (email, project_id, invited_by, token, status) VALUES (?, ?, ?, ?, ?)',
            [email, projectId, invitedBy, token, 'pending']
        );

        try {
            await resend.emails.send({
                from: 'SkillForge <onboarding@resend.dev>',
                to: email,
                subject: 'You are invited to collaborate on SkillForge 🚀',
                html: `
                    <h2>You've been invited to a project</h2>
                    <p><strong>${inviterName}</strong> invited you to collaborate on:</p>
                    <h3>${projectName}</h3>
                    <p>Click below to join:</p>
                    <a href="http://localhost:3000/invite/${token}" style="padding:10px 20px;background:#ff3b3b;color:white;text-decoration:none;border-radius:6px;">Join Project</a>
                    <p>If you don't have an account, you will be asked to sign up first.</p>`
            });
        } catch (error) {
            console.error('Failed to send email via Resend:', error);
        }
        return token;
    }
}
module.exports = ProjectInvite;