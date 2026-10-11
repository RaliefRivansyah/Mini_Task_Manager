module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
        await queryInterface.createTable('tasks', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            title: { type: Sequelize.STRING(200), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
            status: { type: Sequelize.ENUM('to_do', 'pending', 'in_progress', 'done'), allowNull: false, defaultValue: 'to_do' },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('tasks');
    },
};
