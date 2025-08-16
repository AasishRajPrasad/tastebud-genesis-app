import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cookingExperience, setCookingExperience] = useState("");
  const [favoriteIngredients, setFavoriteIngredients] = useState("");
  const [allergies, setAllergies] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check URL parameter to determine if we should show signup form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'true') {
      setIsSignup(true);
    }
  }, []);

  const handleDietaryPreferenceChange = (preference: string, checked: boolean) => {
    if (checked) {
      setDietaryPreferences(prev => [...prev, preference]);
    } else {
      setDietaryPreferences(prev => prev.filter(p => p !== preference));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await authService.signup({
          email,
          password,
          name,
          age: age ? parseInt(age) : undefined,
          location,
          phoneNumber,
          dietaryPreferences,
          cookingExperience,
          favoriteIngredients,
          allergies,
        });
        toast({
          title: "Account created successfully!",
          description: "You can now log in with your credentials.",
        });
        setIsSignup(false);
      } else {
        await authService.login(email, password);
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo", "Low-Carb", "High-Protein", "Diabetic-Friendly"
  ];

  return (
     <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
       <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignup ? "Create Your Culinary Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-gray-600">
             {isSignup ? "Join our cooking community and personalize your experience" : "Sign in to your account"}
          </p>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {isSignup && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-1"
                      min="1"
                      max="120"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, Country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cookingExperience">Cooking Experience</Label>
                  <select
                    id="cookingExperience"
                    className="mt-1 w-full px-4 py-3 border rounded-lg bg-white"
                    value={cookingExperience}
                    onChange={(e) => setCookingExperience(e.target.value)}
                  >
                    <option value="">Select your level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <div>
                  <Label>Dietary Preferences</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dietaryOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={dietaryPreferences.includes(option)}
                          onCheckedChange={(checked) => 
                            handleDietaryPreferenceChange(option, checked as boolean)
                          }
                        />
                        <Label htmlFor={option} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="favoriteIngredients">Favorite Ingredients</Label>
                  <Input
                    id="favoriteIngredients"
                    type="text"
                    placeholder="e.g., garlic, tomatoes, chicken, basil"
                    value={favoriteIngredients}
                    onChange={(e) => setFavoriteIngredients(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    type="text"
                    placeholder="e.g., nuts, dairy, shellfish"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : (isSignup ? "Create Account" : "Sign In")}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
 
