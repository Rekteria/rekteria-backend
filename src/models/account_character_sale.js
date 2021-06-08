module.exports = (sequelize, DataTypes) => {
  const account_character_sale = sequelize.define(
    'account_character_sale',
    {
      id_account: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'account_id',
        },
      },
      id_player: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      price_type: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      price_coins: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price_gold: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      dta_insert: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dta_valid: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dta_sale: {
        type: DataTypes.DATE,
      },
    },
    { freezeTableName: true, timestamps: false }
  );

  account_character_sale.associate = (models) => {
    account_character_sale.belongsTo(models.players, {
      foreignKey: 'id',
    });
  };

  return account_character_sale;
};
