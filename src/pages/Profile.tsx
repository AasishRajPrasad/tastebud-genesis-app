
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import { GeneratedRecipeModal } from "@/components/GeneratedRecipeModal";
import { ShareModal } from "@/components/ShareModal";
import { Recipe, GeneratedRecipe } from "@/types/recipe";
import { storageService } from "@/services/storageService";
import { exportService } from "@/services/exportService";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { User, Edit3, Save, Loader2, ChefHat, Star, TrendingUp, Award, Sparkles, Heart, BookOpen, Share2, FileText, Copy } from "lucide-react";

const Profile = () => {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedGeneratedRecipe, setSelectedGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [shareRecipe, setShareRecipe] = useState<GeneratedRecipe | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    age: "",
    location: "",
    phoneNumber: "",
    cookingExperience: "",
    favoriteIngredients: "",
    allergies: "",
    dietaryPreferences: [] as string[],
  });
  const user = authService.getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
    
    if (user) {
      setProfileData({
        name: user.name || "",
        age: user.age?.toString() || "",
        location: user.location || "",
        phoneNumber: user.phoneNumber || "",
        cookingExperience: user.cookingExperience || "",
        favoriteIngredients: user.favoriteIngredients || "",
        allergies: user.allergies || "",
        dietaryPreferences: user.dietaryPreferences || [],
      });
    }
  }, [user]);

  const loadRecipes = async () => {
    try {
      setRecipesLoading(true);
      const [saved, generated] = await Promise.all([
        storageService.getSavedRecipes(),
        storageService.getGeneratedRecipes()
      ]);
      setSavedRecipes(saved);
      setGeneratedRecipes(generated);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    try {
      await storageService.unsaveRecipe(recipeId);
      setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast({
        title: "Recipe removed from saved recipes",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGeneratedRecipe = async (recipeId: string) => {
    try {
      await storageService.deleteGeneratedRecipe(recipeId);
      setGeneratedRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast({
        title: "Recipe deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await authService.updateUserProfile({
        name: profileData.name,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        location: profileData.location,
        phoneNumber: profileData.phoneNumber,
        cookingExperience: profileData.cookingExperience,
        favoriteIngredients: profileData.favoriteIngredients,
        allergies: profileData.allergies,
        dietaryPreferences: profileData.dietaryPreferences,
      });
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDietaryPreferenceChange = (preference: string, checked: boolean) => {
    if (checked) {
      setProfileData(prev => ({
        ...prev,
        dietaryPreferences: [...prev.dietaryPreferences, preference]
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        dietaryPreferences: prev.dietaryPreferences.filter(p => p !== preference)
      }));
    }
  };

  const handleExportRecipe = async (recipe: GeneratedRecipe) => {
    try {
      await exportService.exportRecipeToPDF(recipe);
      toast({
        title: "Recipe exported!",
        description: "Your recipe has been downloaded as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyRecipe = async (recipe: GeneratedRecipe) => {
    try {
      await exportService.copyToClipboard(recipe);
      toast({
        title: "Recipe copied!",
        description: "Recipe details have been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo", "Low-Carb", "High-Protein", "Diabetic-Friendly"
  ];

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case "Beginner": return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Advanced": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Professional": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getExperienceIcon = (experience: string) => {
    switch (experience) {
      case "Beginner": return <Star className="w-4 h-4" />;
      case "Intermediate": return <TrendingUp className="w-4 h-4" />;
      case "Advanced": return <Award className="w-4 h-4" />;
      case "Professional": return <ChefHat className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Creative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-25 animate-pulse delay-300"></div>
        <Heart className="absolute top-2/3 right-1/4 w-6 h-6 text-pink-300 opacity-50 animate-pulse" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              {user?.name || 'My Profile'}
            </h1>
            <p className="text-xl text-gray-600">Manage your culinary journey</p>
            
            {/* Experience Badge */}
            {profileData.cookingExperience && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mt-4 ${getExperienceColor(profileData.cookingExperience)}`}>
                {getExperienceIcon(profileData.cookingExperience)}
                <span className="font-semibold">{profileData.cookingExperience} Chef</span>
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{savedRecipes.length}</div>
                <div className="text-green-600">Saved Recipes</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{generatedRecipes.length}</div>
                <div className="text-purple-600">AI Creations</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm border border-purple-200">
              <TabsTrigger value="personal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                Saved Recipes {recipesLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : `(${savedRecipes.length})`}
              </TabsTrigger>
              <TabsTrigger value="generated" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                AI Creations {recipesLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : `(${generatedRecipes.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="mt-6">
              <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-2xl">Personal Information</CardTitle>
                    </div>
                    <Button
                      variant={isEditingProfile ? "secondary" : "outline"}
                      onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                      className={`flex items-center gap-2 ${
                        isEditingProfile 
                          ? 'bg-white text-purple-600 hover:bg-gray-100 border-white' 
                          : 'border-white text-white hover:bg-white/20 bg-transparent'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isEditingProfile ? (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* ... keep existing code (form fields) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="profileEmail" className="text-lg font-semibold text-gray-700">Email</Label>
                      <Input
                        id="profileEmail"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="mt-2 bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileName" className="text-lg font-semibold text-gray-700">Full Name</Label>
                      <Input
                        id="profileName"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditingProfile}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="profileAge" className="text-lg font-semibold text-gray-700">Age</Label>
                      <Input
                        id="profileAge"
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                        disabled={!isEditingProfile}
                        className="mt-2"
                        min="1"
                        max="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileLocation" className="text-lg font-semibold text-gray-700">Location</Label>
                      <Input
                        id="profileLocation"
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditingProfile}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="profilePhone" className="text-lg font-semibold text-gray-700">Phone Number</Label>
                      <Input
                        id="profilePhone"
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        disabled={!isEditingProfile}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileExperience" className="text-lg font-semibold text-gray-700">Cooking Experience</Label>
                      <select
                        id="profileExperience"
                        className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                        value={profileData.cookingExperience}
                        onChange={(e) => setProfileData(prev => ({ ...prev, cookingExperience: e.target.value }))}
                        disabled={!isEditingProfile}
                      >
                        <option value="">Select your level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-gray-700">Dietary Preferences</Label>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {dietaryOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-50 transition-colors">
                          <Checkbox
                            id={`profile-${option}`}
                            checked={profileData.dietaryPreferences.includes(option)}
                            onCheckedChange={(checked) => 
                              handleDietaryPreferenceChange(option, checked as boolean)
                            }
                            disabled={!isEditingProfile}
                          />
                          <Label htmlFor={`profile-${option}`} className="text-sm font-medium">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="profileIngredients" className="text-lg font-semibold text-gray-700">Favorite Ingredients</Label>
                    <Input
                      id="profileIngredients"
                      type="text"
                      value={profileData.favoriteIngredients}
                      onChange={(e) => setProfileData(prev => ({ ...prev, favoriteIngredients: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="mt-2"
                      placeholder="e.g., garlic, tomatoes, chicken, basil"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profileAllergies" className="text-lg font-semibold text-gray-700">Allergies</Label>
                    <Input
                      id="profileAllergies"
                      type="text"
                      value={profileData.allergies}
                      onChange={(e) => setProfileData(prev => ({ ...prev, allergies: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="mt-2"
                      placeholder="e.g., nuts, dairy, shellfish"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Recipes Tab */}
            <TabsContent value="saved" className="mt-6">
              {recipesLoading ? (
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="text-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-gray-500 text-lg">Loading saved recipes...</p>
                  </CardContent>
                </Card>
              ) : savedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {savedRecipes.map((recipe) => (
                    <div key={recipe.id} className="relative group">
                      <div className="transform transition-all duration-300 hover:scale-105">
                        <RecipeCard
                          recipe={recipe}
                          onClick={() => setSelectedRecipe(recipe)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsaveRecipe(recipe.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-green-200">
                  <CardContent className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-xl mb-2">No saved recipes yet</p>
                    <p className="text-gray-400">Save recipes from the dashboard to see them here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Generated Recipes Tab */}
            <TabsContent value="generated" className="mt-6">
              {recipesLoading ? (
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="text-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-gray-500 text-lg">Loading AI creations...</p>
                  </CardContent>
                </Card>
              ) : generatedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedRecipes.map((recipe) => (
                    <Card key={recipe.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm border-purple-200">
                      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {recipe.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                          <ChefHat className="w-4 h-4" />
                          {recipe.cuisine} • {recipe.diet}
                        </p>
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setSelectedGeneratedRecipe(recipe)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              View Recipe
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteGeneratedRecipe(recipe.id)}
                            >
                              Delete
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleExportRecipe(recipe)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              PDF
                            </Button>
                            <Button
                              onClick={() => handleCopyRecipe(recipe)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              onClick={() => setShareRecipe(recipe)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
                  <CardContent className="text-center py-16">
                    <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-xl mb-2">No AI creations yet</p>
                    <p className="text-gray-400">Use the AI generator to create amazing recipes</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {selectedRecipe && (
            <RecipeModal
              recipe={selectedRecipe}
              isOpen={!!selectedRecipe}
              onClose={() => setSelectedRecipe(null)}
            />
          )}

          {selectedGeneratedRecipe && (
            <GeneratedRecipeModal
              recipe={selectedGeneratedRecipe}
              isOpen={!!selectedGeneratedRecipe}
              onClose={() => setSelectedGeneratedRecipe(null)}
            />
          )}

          {shareRecipe && (
            <ShareModal
              recipe={shareRecipe}
              isOpen={!!shareRecipe}
              onClose={() => setShareRecipe(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
