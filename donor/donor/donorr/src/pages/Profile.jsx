import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Save
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
      },
      organization: ""
    }
  });

  // Load user data safely
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || ""
        },
        organization: user.organization || ""
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
    setLoading(false);
  };

  // Display role properly
  const roleLabels = {
    donor: "Donor",
    recipient: "Recipient",
    logistics: "Logistics Coordinator",
    admin: "Administrator"
  };

  const roleColors = {
    donor: "bg-red-100 text-red-800",
    recipient: "bg-blue-100 text-blue-800",
    logistics: "bg-green-100 text-green-800",
    admin: "bg-purple-100 text-purple-800"
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-700">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 py-8">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Profile Settings
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your personal details and preferences.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow p-6">

            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-gray-500" />
              </div>

              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>

              <span
                className={`inline-block mt-3 px-2 py-1 text-xs font-semibold rounded-full ${
                  roleColors[user.role]
                }`}
              >
                {roleLabels[user.role] || user.role}
              </span>

              <div className="mt-6 space-y-3 text-gray-500 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3" />
                  {user.email}
                </div>

                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3" />
                  {user.phone || "No phone added"}
                </div>

                {user.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3" />
                    {user.address.city || "City"}, {user.address.state || "State"}
                  </div>
                )}

                {user.organization && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-3" />
                    {user.organization}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-6">Edit Profile</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    {...register("name", { required: "Name required" })}
                    className="mt-1 w-full p-2 border rounded"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    {...register("phone")}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Address</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="md:col-span-2">
                    <label className="block text-sm">Street</label>
                    <input
                      {...register("address.street")}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">City</label>
                    <input
                      {...register("address.city")}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">State</label>
                    <input
                      {...register("address.state")}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">ZIP Code</label>
                    <input
                      {...register("address.zipCode")}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Country</label>
                    <input
                      {...register("address.country")}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                </div>
              </div>

              {/* Organization (only logistics role) */}
              {user.role === "logistics" && (
                <div>
                  <label className="block text-sm">Organization</label>
                  <input
                    {...register("organization")}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
