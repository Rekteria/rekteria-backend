module.exports = (sequelize, DataTypes) => {
  const account_character_sale_history = sequelize.define(
    'account_character_sale_history',
    {
      id_old_account: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_player: {
        type: DataTypes.INTEGER,
        allowNull: false,
        reference: {
          model: 'players',
          key: 'id',
        },
      },
      id_new_account: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price_type: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dta_insert: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dta_sale: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      extornada: {
        type: DataTypes.BOOLEAN,

        defaultValue: null,
      },
    },
    { freezeTableName: true, timestamps: false }
  );

  account_character_sale_history.associate = (models) => {
    account_character_sale_history.belongsTo(models.players, {
      foreignKey: 'id_player',
    });
  };

  return account_character_sale_history;
};
