import { useEffect, useState } from "react";
import {
    createContributor,
    getAllContributors,
} from "../api/contributorApi";

const Contributors = () => {
    const [contributors, setContributors] = useState([]);

    const [form, setForm] = useState({
        name: "",
        houseNumber: "",
        area: "ITA",
        phone: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchContributors = async () => {
        try {
            const data = await getAllContributors();
            setContributors(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load contributors");
        }
    };

    useEffect(() => {
        fetchContributors();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            await createContributor(form);

            setForm({
                name: "",
                houseNumber: "",
                area: "ITA",
                phone: "",
                notes: "",
            });

            await fetchContributors();
        } catch (err) {
            console.error(err);
            setError("Failed to create contributor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1>Contributors</h1>

            <form onSubmit={handleSubmit} className="form-card">
                <h2>Add Contributor</h2>

                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                />

                <input
                    name="houseNumber"
                    placeholder="House Number"
                    value={form.houseNumber}
                    onChange={handleChange}
                />

                <select
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                >
                    <option value="ITA">ITA</option>
                    <option value="ITB">ITB</option>
                    <option value="ITC">ITC</option>

                    <option value="MEA">MEA</option>
                    <option value="MEB">MEB</option>
                    <option value="MEC">MEC</option>
                    <option value="MED">MED</option>
                    <option value="MEE">MEE</option>
                    <option value="MEF">MEF</option>
                    <option value="MEG">MEG</option>
                    <option value="MEH">MEH</option>
                    <option value="MEI">MEI</option>

                    <option value="CVA">CVA</option>
                    <option value="CVB">CVB</option>

                    <option value="PPA">PPA</option>
                    <option value="PPB">PPB</option>
                    <option value="PPC">PPC</option>
                    <option value="PPD">PPD</option>
                    <option value="PPE">PPE</option>
                </select>

                <input
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                />

                <textarea
                    name="notes"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={handleChange}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Contributor"}
                </button>
            </form>

            {error && <p>{error}</p>}

            <div className="table-card">
                <h2>Contributor List</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Phone</th>
                            <th>Notes</th>
                        </tr>
                    </thead>

                    <tbody>
                        {contributors.map((contributor) => (
                            <tr key={contributor.id}>
                                <td>{contributor.name}</td>
                                <td>{contributor.address}</td>
                                <td>{contributor.phone || "-"}</td>
                                <td>{contributor.notes || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Contributors;