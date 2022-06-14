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
        popularity: aggregateLikes,
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
async function getRecipesPreview(recipes_id_array)
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
    return extractPreviewRecipeDetails(recipes_info.data)
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
function extractPreviewRecipeDetails(recipes_info)
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
        return {
            id: id,
            title : title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        }
    })
}

/**
 * @returns 3 preview details for 3 random recipes from spooncular
 */
async function getThreeRandomRecipes()
{
    let random_pool = await getRandomRecipes();
    let filtered_random_pool = random_pool.data.recipes.filter((random) => (random.instructions != "") && (random.image))
    if (filtered_random_pool < 3) { return getThreeRandomRecipes(); }
    return extractPreviewRecipeDetails([filtered_random_pool[0], filtered_random_pool[1], filtered_random_pool[2]]);
}

async function addRecipe(user_id,recipe)
{
    await DButils.execQuery(`INSERT INTO last_viewed_recipes(recipeID,userID, title, readyInMinutes,popularity, vegan, vegetarian, glutenFree,viewed, image) VALUES (${recipe.id},${user_id},'${recipe.title}',${recipe.readyInMinutes},${recipe.popularity},${recipe.vegan}, ${recipe.vegetarian},${recipe.glutenFree}, ${1},'${recipe.image}' )`);
}

async function getPlace(place){
    return await DButils.execQuery(`SELECT * FROM last_viewed_recipes WHERE viewed=${place}`)
}

async function setPlace(recipe,place){
    await DButils.execQuery(`UPDATE last_viewed_recipes SET viewed=${place} WHERE recipeID=${recipe.recipeID}`)
}

async function getPreviouslyViewed(recipe_id)
{
    return await DButils.execQuery(`SELECT * FROM last_viewed_recipes WHERE recipeID=${recipe_id.id}`)
}

async function checkFavorite(user_id){
    return await DButils.execQuery(`SELECT webRecipeID FROM favorite_recipes WHERE user_id=${user_id}`)
}


async function getPersonalRecipes(user_id){
    return await DButils.execQuery(`SELECT * FROM personal_recipes WHERE user_id=${user_id}`)
}

async function postPersonalRecipes(recipe,user_id){
    await DButils.execQuery(`INSERT INTO personal_recipes(user_id, title, readyInMinutes, vegan, vegetarian, glutenFree, imageSrc) VALUES (${user_id},'${recipe.title}',${recipe.readyInMinutes},${recipe.vegan}, ${recipe.vegetarian},${recipe.glutenFree},'${recipe.image}' )`);
}


exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.getThreeRandomRecipes = getThreeRandomRecipes;
exports.addRecipe = addRecipe;
exports.getPlace = getPlace;
exports.setPlace = setPlace;
exports.getPreviouslyViewed = getPreviouslyViewed;
exports.checkFavorite = checkFavorite;
exports.getPersonalRecipes = getPersonalRecipes;
exports.postPersonalRecipes = postPersonalRecipes;



