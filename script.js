document.addEventListener('DOMContentLoaded', () => {
    // Get references to the key HTML elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const recipeResultsDiv = document.getElementById('recipeResults');

    // Function to set the theme based on the current body attribute
    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme); // Save preference
        
        // Update the button icon
        themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }

    // Function to toggle between themes
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    // Initialization: Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    // Default to 'light' if no preference is saved
    const initialTheme = savedTheme || 'light'; 
    setTheme(initialTheme); 

    // Add listener to the new button
    themeToggle.addEventListener('click', toggleTheme);

    // Base URL for TheMealDB API search by name
    const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

    /**
     * Fetches recipes from the TheMealDB API based on the user's search term.
     * @param {string} searchTerm The keyword or dish name to search for.
     */
    async function fetchRecipes(searchTerm) {
        // Clear previous results and show a loading message
        recipeResultsDiv.innerHTML = '<p class="initial-message">Searching for recipes...</p>';

        try {
            const url = `${API_BASE_URL}${searchTerm}`;
            const response = await fetch(url);
            
            // Check if the network response was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // The API returns recipes in the 'meals' array
            displayRecipes(data.meals);

        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeResultsDiv.innerHTML = '<p class="initial-message error">Sorry, an error occurred while fetching data. Please try again later.</p>';
        }
    }

    /**
     * Takes the array of recipe data and generates the HTML to display them.
     * @param {Array<Object> | null} meals An array of recipe objects, or null if no results.
     */
    function displayRecipes(meals) {
        // Start with a clean slate
        recipeResultsDiv.innerHTML = ''; 

        if (!meals) {
            recipeResultsDiv.innerHTML = `<p class="initial-message">No recipes found for that search. Try another keyword!</p>`;
            return;
        }

        meals.forEach(meal => {
            // Create a div for the individual recipe card
            const card = document.createElement('div');
            card.className = 'recipe-card';
            
            // Use strMealThumb for the image and strSource or strYoutube for the link
            const recipeName = meal.strMeal;
            const imageUrl = meal.strMealThumb;
            const linkUrl = meal.strSource || meal.strYoutube || '#'; // Fallback to '#' if no link is provided
            
            // Create the HTML content for the card
            card.innerHTML = `
                <img src="${imageUrl}" alt="${recipeName}">
                <div class="card-content">
                    <h3>${recipeName}</h3>
                    <a href="${linkUrl}" target="_blank" rel="noopener noreferrer">View Full Recipe</a>
                </div>
            `;
            
            // Add the new card to the results container
            recipeResultsDiv.appendChild(card);
        });
    }

    // --- Event Listeners ---

    // 1. Handle button click
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            fetchRecipes(searchTerm);
        } else {
            // Show a friendly message if input is empty
            recipeResultsDiv.innerHTML = '<p class="initial-message">Please enter a search term (e.g., "Chicken") before clicking search.</p>';
        }
    });

    // 2. Handle 'Enter' key press on the input field
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click(); // Trigger the button click handler
        }
    });
});