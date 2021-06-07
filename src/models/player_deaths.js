module.exports = (sequelize, DataTypes) => {
  const player_deaths = sequelize.define(
    'player_deaths',
    {
      player_id: {
        type: DataTypes.INTEGER,
        reference: {
          model: 'players',
          key: 'id',
        },
      },
      time: {
        type: DataTypes.DATE,
        primaryKey: true,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      killed_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_player: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      mostdamage_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mostdamage_is_player: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      unjustified: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      mostdamage_unjustified: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    { freezeTableName: true, timestamps: false }
  );

  player_deaths.associate = (models) => {
    player_deaths.belongsTo(models.players, { foreignKey: 'player_id' });
  };

  return player_deaths;
};
