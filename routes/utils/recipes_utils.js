const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");



/**
 * Get relevant recipe info from spooncular response 
 * @param {*} recipe_id 
 */
async function getRecipeInformation(recipe_id) 
{
    return await axios.get(`${api_domain}/${recipe_id}/information`, 
    {
        params: 
        {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}


/**
 * Extract the relevant fields from the spooncular recipe info 
 * @param {*} recipe_id 
 * @returns 
 */
async function getRecipeDetails(recipe_id) 
{
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    }
}

/**
 * Get preview details for each recipe in a recipes list by its id
 * @param {*} recipes_id_array 
 * @returns 
 */
async function getRecipesPreview(user_name, recipes_id_array)
{
    let ids = ""
    recipes_id_array.map((recipe_id) => {
        if (recipe_id != null)
            ids += ("," + recipe_id);
    })
    const recipes_info = await axios.get(`${api_domain}/informationBulk`, 
    {
        params: 
        {
            ids: ids,
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return extractPreviewRecipeDetails(user_name, recipes_info.data)
}

/**
 * Get a list of 10 random recipes from spooncular
 * @returns random_recipes 
 */
async function getRandomRecipes()
{
    const random_recipes = await axios.get(`${api_domain}/random`, 
    {
        params: 
        {
            number: 10,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return random_recipes;
}

/**
 * Extract a preview for each recipe details in recipes infos list 
 * @param {*} recipes_info 
 * @returns 
 */
function extractPreviewRecipeDetails(user_name, recipes_info)
{
    return recipes_info.map((recipe_info) => {
        let data = recipe_info;
        if (recipe_info.data) {
            data = recipe_info.data;
        }
        const {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
        } = data;

        if (user_name == undefined)
        {
            return {
                id: id,
                title : title,
                readyInMinutes: readyInMinutes,
                image: image,
                aggregateLikes: aggregateLikes,
                vegan: vegan,
                vegetarian: vegetarian,
                glutenFree: glutenFree,
                viewed: false,
                favorites: false
            }
        }
        const seen = DButils.execQuery(`SELECT viewed FROM last_viewed_recipes WHERE recipeID='${data.id}' AND user_name='${user_name}'`)
        let viewed = false;
        if (seen != []) { viewed = true; }

        let fav = false;
        const favDB = DButils.execQuery(`SELECT * FROM favorite_recipes WHERE webRecipeID='${data.id}' AND user_name='${user_name}'`)
        if (favDB != []) { fav = true; }


        return {
            id: id,
            title : title,
            readyInMinutes: readyInMinutes,
            image: image,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            viewed: viewed,
            favorites: fav
        }
    })
}

/**
 * @returns 3 preview details for 3 random recipes from spooncular
 */
async function getThreeRandomRecipes(user_name)
{
    let random_pool = await getRandomRecipes();
    let filtered_random_pool = random_pool.data.recipes.filter((random) => (random.instructions != "") && (random.image))
    if (filtered_random_pool < 3) { return getThreeRandomRecipes(); }
    return extractPreviewRecipeDetails(user_name, [filtered_random_pool[0], filtered_random_pool[1], filtered_random_pool[2]]);
}


async function addRecipe(user_name,recipe)
{
    await DButils.execQuery(`INSERT INTO last_viewed_recipes(recipeID, user_name, title, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, viewed, image) VALUES (${recipe.id},'${user_name}','${recipe.title}',${recipe.readyInMinutes},${recipe.aggregateLikes},${recipe.vegan}, ${recipe.vegetarian},${recipe.glutenFree}, ${1},'${recipe.image}' )`);
}

async function getPlace(user_name,place){
    return await DButils.execQuery(`SELECT * FROM last_viewed_recipes WHERE user_name='${user_name}' and viewed=${place}`)
}

async function setPlace(user_name, recipe, place){
    await DButils.execQuery(`UPDATE last_viewed_recipes SET viewed=${place} WHERE recipeID=${recipe.recipeID} and user_name='${user_name}'`)
}

async function getPreviouslyViewed(recipe_id)
{
    return await DButils.execQuery(`SELECT * FROM last_viewed_recipes WHERE recipeID=${recipe_id.id}`)
}

async function checkFavorite(user_name){
    return await DButils.execQuery(`SELECT webRecipeID FROM favorite_recipes WHERE user_name='${user_name}'`)
}

async function getIngredients(recipe_id)
{
    const ingredientsAPI = await axios.get(`${api_domain}/${recipe_id}/ingredientWidget.json`,
    {
        params: 
        {
            apiKey: process.env.spooncular_apiKey
        }
    });
    let ingredients = [];
    ingredientsAPI.data.ingredients.map((ingredient) => {  
        ingredients.push([ingredient.name, ingredient.amount.us.unit, ingredient.amount.us.value]);
    });
    return ingredients;
}

async function getServings(recipe_id)
{
    const recipe = await axios.get(`${api_domain}/${recipe_id}/information`,
    {
        params: 
        {
            apiKey: process.env.spooncular_apiKey
        }
    });
    return recipe.data.servings;
}


async function getSteps(recipe_id)
{
    const analyzedInstructions = await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`,
    {
        params: 
        {
            apiKey: process.env.spooncular_apiKey
        }
    });
    let steps = [];
    analyzedInstructions.data[0].steps.map((step) => {  
        steps.push(step.step);
    });
    return steps;
}

exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.getThreeRandomRecipes = getThreeRandomRecipes;
exports.addRecipe = addRecipe;
exports.getPlace = getPlace;
exports.setPlace = setPlace;
exports.getPreviouslyViewed = getPreviouslyViewed;
exports.checkFavorite = checkFavorite;
exports.getIngredients = getIngredients;
exports.getServings = getServings;
exports.getSteps = getSteps;