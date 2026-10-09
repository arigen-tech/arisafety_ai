import { useEffect, useState } from "react";
import { TitleBar } from "../components/UI/TitleBar";
import { IoMdCall } from "react-icons/io";
import { MdOutlineMailOutline } from "react-icons/md";
import Swal from "sweetalert2";
import { getRequest } from "../service/apiService";
import { API_HOST } from "../config/apiConfig";

const ENDPOINTS = {
    BUSINESS_UNIT: "/api/catalog/business_unit",
    PLANT: "/api/catalog/plant",
    DEPARTMENT: "/api/catalog/department",
    ROLE: "/api/catalog/role",
    PROFILE: "/api/profile/me",
    UPDATE_PROFILE: (userId) => `/api/profile/${userId}`, // PATCH /api/profile/{user_id}
};

// JSON body ke saath PATCH bhejta hai (token ke saath). apiService mein patch function nahi hai.
const sendJson = async (method, endpoint, data) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${API_HOST}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message =
            (body && typeof body === "object" && body.message) ||
            (typeof body === "string" && body) ||
            response.statusText ||
            "Request failed";
        const error = new Error(message);
        error.status = response.status;
        error.response = body;
        throw error;
    }
    return body;
};

// response array ho ya { data: [...] }, dono chalega
const toArray = (json) => (Array.isArray(json) ? json : json?.data || json?.items || json?.rows || []);

const pick = (obj, keys, fallback = "") => {
    for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
    return fallback;
};

// dropdown option ka id aur label
const getId = (o, i) => pick(o, ["id", "business_unit_id", "plant_id", "department_id", "role_id", "value"], i);

const NAME_KEYS = [
    "name", "plant_name", "plantName", "plant", "plant_desc", "plant_description",
    "business_unit_name", "department_name", "role_name", "roleName",
    "label", "title", "description", "plant_code", "code", "unit_code",
];
const SKIP_KEYS = /(^id$|_id$|Id$|created|updated|status|date|time|^is_|^active)/i;

const getName = (o) => {
    const direct = pick(o, NAME_KEYS, "");
    if (direct !== "") return String(direct);
    const entry = Object.entries(o || {}).find(
        ([k, v]) => typeof v === "string" && v.trim() !== "" && !SKIP_KEYS.test(k)
    );
    return entry ? entry[1] : "";
};

// id ko string banata hai (select ki value ke liye); object ho to uski id
const asId = (v) => {
    if (v === undefined || v === null || v === "") return "";
    return String(typeof v === "object" ? v.id ?? "" : v);
};

// /api/profile/me aur PATCH /api/profile/{user_id} dono ka response isi shape mein aata hai:
// { user_id, username, email, first_name, last_name, name, role, business_unit, business_unit_name,
//   location, mobile_number, plant, plant_name, department, department_name }
const mapProfile = (raw) => {
    const p = Array.isArray(raw) ? raw[0] : raw?.data ?? raw ?? {};
    const firstName = pick(p, ["first_name", "firstName"]);
    const lastName = pick(p, ["last_name", "lastName"]);
    return {
        id: pick(p, ["user_id", "userId", "id"], ""),
        firstName,
        lastName,
        name: pick(p, ["name"], `${firstName} ${lastName}`.trim()),
        jobProfile: typeof p.role === "object" ? p.role?.name ?? "" : pick(p, ["role", "role_name"], ""),
        email: pick(p, ["email"]),
        mobile: String(pick(p, ["mobile_number", "mobileNumber", "mobile", "phone"], "")),
        photo: pick(p, ["profile_image", "profileImage", "photo", "avatar"], ""),
        businessUnitId: asId(p.business_unit ?? p.business_unit_id),
        plantId: asId(p.plant ?? p.plant_id),
        departmentId: asId(p.department ?? p.department_id),
    };
};

const profileToForm = (m) => ({
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email,
    mobile: m.mobile,
    businessUnitId: m.businessUnitId,
    plantId: m.plantId,
    departmentId: m.departmentId,
    roleId: "",
});

export const Profile = () => {

    const [editProfile, setEditProfile] = useState(false);

    const [businessUnits, setBusinessUnits] = useState([]);
    const [plants, setPlants] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        businessUnitId: "",
        plantId: "",
        departmentId: "",
        roleId: "",
    });

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleEditProfile = () => {
        setEditProfile(!editProfile);
    }

    // ---------- Profile data (GET /api/profile/me) ----------
    useEffect(() => {
        let ignore = false;
        const loadProfile = async () => {
            try {
                const res = await getRequest(ENDPOINTS.PROFILE);
                console.log("profile response:", res); // mapping sahi hone par hata dena
                if (ignore) return;
                const mapped = mapProfile(res);
                setProfile(mapped);
                setForm(profileToForm(mapped)); // edit form current values se bhar do
            } catch (err) {
                console.error("Profile load failed:", err);
            } finally {
                if (!ignore) setProfileLoading(false);
            }
        };
        loadProfile();
        return () => { ignore = true; };
    }, []);

    // ---------- Four dropdowns (GET APIs) ----------
    useEffect(() => {
        const loadDropdowns = async () => {
            const results = await Promise.allSettled([
                getRequest(ENDPOINTS.BUSINESS_UNIT),
                getRequest(ENDPOINTS.PLANT),
                getRequest(ENDPOINTS.DEPARTMENT),
                getRequest(ENDPOINTS.ROLE),
            ]);

            const [bu, pl, dp, rl] = results;
            if (bu.status === "fulfilled") setBusinessUnits(toArray(bu.value));
            if (pl.status === "fulfilled") setPlants(toArray(pl.value));
            if (dp.status === "fulfilled") setDepartments(toArray(dp.value));
            if (rl.status === "fulfilled") setRoles(toArray(rl.value));

            results.forEach((r, i) => {
                if (r.status === "rejected") {
                    console.error(`Dropdown API failed (${Object.keys(ENDPOINTS)[i]}):`, r.reason);
                }
            });
        };
        loadDropdowns();
    }, []);

    // profile me role sirf naam (jaise "Team Lead") aata hai, isliye naam se role dropdown select karo
    useEffect(() => {
        if (!profile?.jobProfile || !roles.length) return;
        const match = roles.find(
            (r, i) => getName(r).trim().toLowerCase() === String(profile.jobProfile).trim().toLowerCase()
        );
        if (match) {
            const matchId = String(getId(match, roles.indexOf(match)));
            setForm((prev) => (prev.roleId === matchId ? prev : { ...prev, roleId: matchId }));
        }
    }, [profile, roles]);

    // ---------- Update profile (PATCH /api/profile/{user_id}) ----------
    const toIntOrNull = (v) => (v === "" || v === undefined || v === null ? null : Number(v));

    const handleSave = async () => {
        if (!profile?.id) {
            Swal.fire({ icon: "error", title: "User id nahi mili", text: "profile/me response mein user_id check karo" });
            return;
        }
        if (!form.firstName.trim()) {
            Swal.fire({ icon: "warning", title: "First name zaroori hai" });
            return;
        }
        if (form.mobile && !/^\d{10}$/.test(form.mobile.trim())) {
            Swal.fire({ icon: "warning", title: "Mobile number 10 digits ka hona chahiye" });
            return;
        }

        setSaving(true);
        try {
            // Swagger schema: first_name, last_name, email, mobile_number, business_unit, plant, department
            const updated = await sendJson("PATCH", ENDPOINTS.UPDATE_PROFILE(profile.id), {
                first_name: form.firstName.trim(),
                last_name: form.lastName.trim(),
                email: form.email.trim(),
                mobile_number: form.mobile.trim() ? Number(form.mobile.trim()) : null,
                business_unit: toIntOrNull(form.businessUnitId),
                plant: toIntOrNull(form.plantId),
                department: toIntOrNull(form.departmentId),
            });

            // server updated profile wapas deta hai, usi se cards refresh
            const mapped = mapProfile(updated);
            setProfile((prev) => ({ ...prev, ...mapped, photo: mapped.photo || prev?.photo }));
            setForm((prev) => ({ ...profileToForm(mapped), roleId: prev.roleId }));
            setEditProfile(false);
            Swal.fire({ icon: "success", title: "Profile updated successfully", timer: 1800, showConfirmButton: false });
        } catch (err) {
            console.error("Profile update failed:", err);
            const detail = err.response?.detail;
            const msg = Array.isArray(detail)
                ? detail.map((d) => `${d.loc?.slice(1).join(".")}: ${d.msg}`).join("\n")
                : err.message;
            Swal.fire({ icon: "error", title: "Could not update profile", text: msg || "Unable to connect to the server" });
        } finally {
            setSaving(false);
        }
    };

    const renderOptions = (list) =>
        list.map((o, i) => {
            const id = getId(o, i);
            return <option key={id} value={id}>{getName(o)}</option>;
        });

    return (
        <>
            <TitleBar title="My Profile" />

            <div className="card profile mb-20">
                <div className="">
                    <div className="profile-pic">
                        <img src={profile?.photo || "images/profile-img.png"} alt="Profile image" width="105" height="105" />
                        <button type="button" aria-label="upload pic">
                            <img src="images/icons/camera-icon.svg" alt="camera Icon" />
                        </button>
                    </div>
                    <h2>{profileLoading ? "Loading..." : profile?.name || "-"}</h2>
                    <p>{profile?.jobProfile || "-"}</p>
                    <button type="button" className="btn-edit" onClick={handleEditProfile}>
                        <img src="images/icons/edit-icon.svg" alt="Edit Icon" />
                        <span> Edit Profile</span>
                    </button>
                </div>
            </div>

            <div className="card contact-links mb-20">
                <div className="">
                    <h2>Contact Information</h2>
                    <a href={profile?.mobile ? `tel:${profile.mobile}` : undefined}><IoMdCall />
                        <span>{profile?.mobile || "-"}</span></a>
                    <a href={profile?.email ? `mailto:${profile.email}` : undefined}><MdOutlineMailOutline />
                        <span>{profile?.email || "-"}</span></a>
                </div>

            </div>


            {editProfile && <div className="card">
                <div className="grid mb-15">
                    <div className="form-group">
                        <label htmlFor="firstNameId">First Name</label>
                        <input type="text" maxLength="30" id="firstNameId" name="firstName"
                            value={form.firstName} onChange={handleChange} placeholder="" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastNameId">Last Name</label>
                        <input type="text" maxLength="30" id="lastNameId" name="lastName"
                            value={form.lastName} onChange={handleChange} placeholder="" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailId">Email</label>
                        <input type="email" maxLength="50" id="emailId" name="email"
                            value={form.email} onChange={handleChange} placeholder="" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobileId">Mobile</label>
                        <input type="text" maxLength="10" id="mobileId" name="mobile"
                            value={form.mobile} onChange={handleChange} placeholder="" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="businessUnitId">Business Unit</label>
                        <select id="businessUnitId" name="businessUnitId"
                            value={form.businessUnitId} onChange={handleChange}>
                            <option value="">Select</option>
                            {renderOptions(businessUnits)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="plantId">Plant</label>
                        <select id="plantId" name="plantId"
                            value={form.plantId} onChange={handleChange}>
                            <option value="">Select</option>
                            {renderOptions(plants)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="departmentId">Department</label>
                        <select id="departmentId" name="departmentId"
                            value={form.departmentId} onChange={handleChange}>
                            <option value="">Select</option>
                            {renderOptions(departments)}
                        </select>
                    </div>
                    <div className="form-group">
                        {/* update API role accept nahi karti, isliye role sirf dikhta hai (disabled) */}
                        <label htmlFor="roleId">User Role</label>
                        <select id="roleId" name="roleId"
                            value={form.roleId} onChange={handleChange} disabled>
                            <option value="">Select</option>
                            {renderOptions(roles)}
                        </select>
                    </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>}


        </>
    )
}