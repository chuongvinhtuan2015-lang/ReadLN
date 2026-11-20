import prisma from '../config/db';

export class BackupService {
  /**
   * Tạo bản sao lưu toàn bộ dữ liệu MySQL dưới dạng file SQL dump hoàn chỉnh
   */
  static async generateSqlDump(): Promise<string> {
    const [
      genres,
      stories,
      storyGenres,
      chapters,
      users,
      bookmarks,
      ratings,
      comments,
      systemSettings,
    ] = await Promise.all([
      prisma.genres.findMany(),
      prisma.stories.findMany(),
      prisma.story_genres.findMany(),
      prisma.chapters.findMany(),
      prisma.users.findMany(),
      prisma.bookmarks.findMany(),
      prisma.ratings.findMany(),
      prisma.comments.findMany(),
      prisma.system_settings.findMany(),
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let sql = `-- ========================================================\n`;
    sql += `-- ReadLN Database Backup (NIST CSF: RECOVER)\n`;
    sql += `-- Generated At: ${new Date().toISOString()}\n`;
    sql += `-- Target: MySQL / MariaDB (utf8mb4)\n`;
    sql += `-- ========================================================\n\n`;
    sql += `SET NAMES utf8mb4;\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // Helper escape chuỗi an toàn
    const escape = (val: any): string => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'bigint') return val.toString();
      if (typeof val === 'boolean') return val ? '1' : '0';
      if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
    };

    // 1. Genres
    sql += `-- Table: genres (${genres.length} records)\n`;
    if (genres.length > 0) {
      for (const g of genres) {
        sql += `REPLACE INTO \`genres\` (\`id\`, \`name\`, \`slug\`) VALUES (${escape(g.id)}, ${escape(g.name)}, ${escape(g.slug)});\n`;
      }
    }
    sql += `\n`;

    // 2. Stories
    sql += `-- Table: stories (${stories.length} records)\n`;
    if (stories.length > 0) {
      for (const s of stories) {
        sql += `REPLACE INTO \`stories\` (\`id\`, \`title\`, \`slug\`, \`author_name\`, \`summary\`, \`view_count\`, \`is_deleted\`, \`created_at\`, \`updated_at\`) VALUES (${escape(s.id)}, ${escape(s.title)}, ${escape(s.slug)}, ${escape(s.author_name)}, ${escape(s.summary)}, ${escape(s.view_count)}, ${escape(s.is_deleted)}, ${escape(s.created_at)}, ${escape(s.updated_at)});\n`;
      }
    }
    sql += `\n`;

    // 3. Story_Genres
    sql += `-- Table: story_genres (${storyGenres.length} records)\n`;
    if (storyGenres.length > 0) {
      for (const sg of storyGenres) {
        sql += `REPLACE INTO \`story_genres\` (\`story_id\`, \`genre_id\`) VALUES (${escape(sg.story_id)}, ${escape(sg.genre_id)});\n`;
      }
    }
    sql += `\n`;

    // 4. Chapters
    sql += `-- Table: chapters (${chapters.length} records)\n`;
    if (chapters.length > 0) {
      for (const c of chapters) {
        sql += `REPLACE INTO \`chapters\` (\`id\`, \`story_id\`, \`chapter_number\`, \`title\`, \`content\`, \`word_count\`, \`is_deleted\`, \`created_at\`, \`updated_at\`) VALUES (${escape(c.id)}, ${escape(c.story_id)}, ${escape(c.chapter_number)}, ${escape(c.title)}, ${escape(c.content)}, ${escape(c.word_count)}, ${escape(c.is_deleted)}, ${escape(c.created_at)}, ${escape(c.updated_at)});\n`;
      }
    }
    sql += `\n`;

    // 5. Users
    sql += `-- Table: users (${users.length} records)\n`;
    if (users.length > 0) {
      for (const u of users) {
        sql += `REPLACE INTO \`users\` (\`id\`, \`username\`, \`email\`, \`password_hash\`, \`role\`, \`failed_login_attempts\`, \`lockout_until\`, \`created_at\`, \`updated_at\`) VALUES (${escape(u.id)}, ${escape(u.username)}, ${escape(u.email)}, ${escape(u.password_hash)}, ${escape(u.role)}, ${escape(u.failed_login_attempts)}, ${escape(u.lockout_until)}, ${escape(u.created_at)}, ${escape(u.updated_at)});\n`;
      }
    }
    sql += `\n`;

    // 6. Bookmarks
    sql += `-- Table: bookmarks (${bookmarks.length} records)\n`;
    if (bookmarks.length > 0) {
      for (const b of bookmarks) {
        sql += `REPLACE INTO \`bookmarks\` (\`user_id\`, \`story_id\`, \`created_at\`) VALUES (${escape(b.user_id)}, ${escape(b.story_id)}, ${escape(b.created_at)});\n`;
      }
    }
    sql += `\n`;

    // 7. Ratings
    sql += `-- Table: ratings (${ratings.length} records)\n`;
    if (ratings.length > 0) {
      for (const r of ratings) {
        sql += `REPLACE INTO \`ratings\` (\`id\`, \`story_id\`, \`user_id\`, \`score\`, \`created_at\`) VALUES (${escape(r.id)}, ${escape(r.story_id)}, ${escape(r.user_id)}, ${escape(r.score)}, ${escape(r.created_at)});\n`;
      }
    }
    sql += `\n`;

    // 8. Comments
    sql += `-- Table: comments (${comments.length} records)\n`;
    if (comments.length > 0) {
      for (const cm of comments) {
        sql += `REPLACE INTO \`comments\` (\`id\`, \`story_id\`, \`chapter_id\`, \`user_id\`, \`content\`, \`is_flagged\`, \`is_deleted\`, \`created_at\`) VALUES (${escape(cm.id)}, ${escape(cm.story_id)}, ${escape(cm.chapter_id)}, ${escape(cm.user_id)}, ${escape(cm.content)}, ${escape(cm.is_flagged)}, ${escape(cm.is_deleted)}, ${escape(cm.created_at)});\n`;
      }
    }
    sql += `\n`;

    // 9. System settings
    sql += `-- Table: system_settings (${systemSettings.length} records)\n`;
    if (systemSettings.length > 0) {
      for (const ss of systemSettings) {
        sql += `REPLACE INTO \`system_settings\` (\`setting_key\`, \`setting_value\`, \`updated_at\`) VALUES (${escape(ss.setting_key)}, ${escape(ss.setting_value)}, ${escape(ss.updated_at)});\n`;
      }
    }
    sql += `\n`;

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    sql += `-- End of Backup (${timestamp})\n`;

    return sql;
  }
}
