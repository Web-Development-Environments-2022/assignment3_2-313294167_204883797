const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`INSERT INTO favorite_recipes(user_id, webRecipeID) VALUES ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT webRecipeID FROM favorite_recipes WHERE user_id='${user_id}'`);
    return recipes_id;
}

async function getThreeLastViewed(user_id){
    const recipes_id = await DButils.execQuery(`SELECT lastViewedRecipe1, lastViewedRecipe2, lastViewedRecipe3 FROM users WHERE user_id='${user_id}'`);
    return recipes_id;
}

async function markAsLastViewed(user_id, recipe_id){
    let response = await DButils.execQuery(`SELECT lastViewedIndexToChange FROM users WHERE user_id='${user_id}'`);
    console.log(response[0].lastViewedIndexToChange)
    let idxToChange = response[0].lastViewedIndexToChange;
    if (idxToChange == undefined)
        idxToChange = 1;
    if (idxToChange == 1)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe1='${recipe_id}' WHERE user_id='${user_id}'`);
        idxToChange++;
    }
    else if (idxToChange == 2)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe2='${recipe_id}' WHERE user_id='${user_id}'`);
        idxToChange++;
    }
    else if (idxToChange == 3)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe3='${recipe_id}' WHERE user_id='${user_id}'`);
        idxToChange = 1;
    }
    await DButils.execQuery(`UPDATE users SET lastViewedIndexToChange='${idxToChange}' WHERE user_id='${user_id}'`);
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getThreeLastViewed = getThreeLastViewed;
exports.markAsLastViewed = markAsLastViewed;