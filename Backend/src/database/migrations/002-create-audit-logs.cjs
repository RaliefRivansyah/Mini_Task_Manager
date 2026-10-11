module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('audit_logs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            task_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'tasks', key: 'id' }, onDelete: 'CASCADE' },
            actor: { type: Sequelize.STRING(100), allowNull: false },
            from_status: { type: Sequelize.STRING(30), allowNull: false },
            to_status: { type: Sequelize.STRING(30), allowNull: false },
            timestamp: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        });
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION prevent_audit_log_mutation() RETURNS trigger AS $$
      BEGIN RAISE EXCEPTION 'Audit logs are immutable'; END; $$ LANGUAGE plpgsql;
      CREATE TRIGGER audit_log_immutable BEFORE UPDATE OR DELETE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();
    `);
    },
    async down(queryInterface) {
        await queryInterface.sequelize.query(
            'DROP TRIGGER IF EXISTS audit_log_immutable ON audit_logs; DROP FUNCTION IF EXISTS prevent_audit_log_mutation();',
        );
        await queryInterface.dropTable('audit_logs');
    },
};
