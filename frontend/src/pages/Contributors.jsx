import {
    useEffect,
    useMemo,
    useState,
} from "react";



import {

    createContributor,

    deleteContributor,

    getAllContributors,

    updateContributor,

} from "../api/contributorApi";



import {
    getAreas,
} from "../api/masterDataApi";

import Pagination from "../components/Pagination";

const createEmptyForm = (defaultArea = "") => ({
    name: "",
    houseNumber: "",
    area: defaultArea,
    phone: "",
    notes: "",
});





const Contributors = () => {

    const [

        contributors,

        setContributors,

    ] = useState([]);



    const [
        areas,
        setAreas,
    ] = useState([]);

    const [
        loadingAreas,
        setLoadingAreas,
    ] = useState(false);

    const [
        form,
        setForm,
    ] = useState(
        createEmptyForm()
    );



    const [

        editingId,

        setEditingId,

    ] = useState(null);



    const [

        loading,

        setLoading,

    ] = useState(false);



    const [

        deletingId,

        setDeletingId,

    ] = useState(null);



    const [

        error,

        setError,

    ] = useState("");



    const [

        searchTerm,

        setSearchTerm,

    ] = useState("");



    const [

        selectedAreas,

        setSelectedAreas,

    ] = useState([]);



    const [

        areaDropdownOpen,

        setAreaDropdownOpen,

    ] = useState(false);



    /*

     * Sorting

     */

    const [

        sortConfig,

        setSortConfig,

    ] = useState({

        key: "name",

        direction: "asc",

    });



    /*

     * Pagination

     */

    const [

        currentPage,

        setCurrentPage,

    ] = useState(1);



    const [

        pageSize,

        setPageSize,

    ] = useState(10);


    const activeAreas = useMemo(
        () =>
            areas
                .filter((area) => area.active !== false)
                .sort((first, second) =>
                    first.name.localeCompare(second.name)
                ),
        [areas]
    );

    const filterAreas = useMemo(() => {
        const areaMap = new Map();

        areas.forEach((area) => {
            areaMap.set(area.code, area);
        });

        contributors.forEach((contributor) => {
            if (
                !contributor.area ||
                areaMap.has(contributor.area)
            ) {
                return;
            }

            areaMap.set(contributor.area, {
                code: contributor.area,
                name:
                    contributor.areaName ||
                    contributor.area,
                active: false,
            });
        });

        return Array.from(areaMap.values()).sort(
            (first, second) =>
                first.name.localeCompare(second.name)
        );
    }, [areas, contributors]);

    const formAreaOptions = useMemo(() => {
        const optionMap = new Map();

        activeAreas.forEach((area) => {
            optionMap.set(area.code, area);
        });

        if (
            editingId !== null &&
            form.area &&
            !optionMap.has(form.area)
        ) {
            const currentArea = areas.find(
                (area) => area.code === form.area
            );

            optionMap.set(
                form.area,
                currentArea || {
                    code: form.area,
                    name: form.area,
                    active: false,
                }
            );
        }

        return Array.from(optionMap.values()).sort(
            (first, second) =>
                first.name.localeCompare(second.name)
        );
    }, [
        activeAreas,
        areas,
        editingId,
        form.area,
    ]);

    const getDefaultAreaCode = () =>
        activeAreas.length > 0
            ? activeAreas[0].code
            : "";

    const getAreaDisplayName = (areaCode) => {
        const area = filterAreas.find(
            (item) => item.code === areaCode
        );

        return area?.name || areaCode || "-";
    };

    const loadAreas = async () => {
        try {
            setLoadingAreas(true);

            const data = await getAreas(false);

            setAreas(data);

            const firstActiveArea = data
                .filter((area) => area.active !== false)
                .sort((first, second) =>
                    first.name.localeCompare(second.name)
                )[0];

            if (firstActiveArea) {
                setForm((previous) =>
                    previous.area
                        ? previous
                        : {
                            ...previous,
                            area: firstActiveArea.code,
                        }
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load areas"
            );
        } finally {
            setLoadingAreas(false);
        }
    };






    const fetchContributors =

        async () => {

            try {

                setError("");



                const data =

                    await getAllContributors();



                setContributors(

                    data

                );



            } catch (err) {

                console.error(err);



                setError(

                    err.response

                        ?.data

                        ?.message ||

                    "Failed to load contributors"

                );

            }

        };





    useEffect(() => {
        loadAreas();
        fetchContributors();
    }, []);





    /*

     * Return to first page whenever

     * the filters change.

     */

    useEffect(() => {

        setCurrentPage(1);



    }, [

        searchTerm,

        selectedAreas,

    ]);





    const handleChange = (

        event

    ) => {

        const {

            name,

            value,

        } = event.target;



        setForm(

            (previous) => ({

                ...previous,



                [name]:

                    value,

            })

        );

    };





    const resetForm = () => {
        setForm(
            createEmptyForm(
                getDefaultAreaCode()
            )
        );

        setEditingId(null);
    };





    const handleEdit = (

        contributor

    ) => {

        setError("");



        setEditingId(

            contributor.id

        );



        setForm({

            name:

                contributor.name,



            houseNumber:

                contributor.houseNumber,



            area:

                contributor.area,



            phone:

                contributor.phone ||

                "",



            notes:

                contributor.notes ||

                "",

        });



        window.scrollTo({

            top: 0,

            behavior: "smooth",

        });

    };





    const handleCancelEdit =

        () => {

            resetForm();



            setError("");

        };





    const handleSubmit =

        async (event) => {

            event.preventDefault();



            try {

                setLoading(true);



                setError("");



                if (

                    editingId !==

                    null

                ) {

                    await updateContributor(

                        editingId,

                        form

                    );



                } else {

                    await createContributor(

                        form

                    );

                }



                resetForm();



                await fetchContributors();



            } catch (err) {

                console.error(err);



                const message =

                    err.response

                        ?.data

                        ?.message ||

                    (editingId !==

                        null

                        ? "Failed to update contributor"

                        : "Failed to create contributor");



                setError(

                    message

                );



            } finally {

                setLoading(false);

            }

        };





    const handleDelete =

        async (id) => {

            const shouldDelete =

                window.confirm(

                    "Are you sure you want to delete this contributor?"

                );



            if (

                !shouldDelete

            ) {

                return;

            }



            try {

                setDeletingId(

                    id

                );



                setError("");



                await deleteContributor(

                    id

                );



                if (

                    editingId ===

                    id

                ) {

                    resetForm();

                }



                await fetchContributors();



            } catch (err) {

                console.error(err);



                const message =

                    err.response

                        ?.data

                        ?.message ||

                    "Failed to delete contributor";



                setError(

                    message

                );



            } finally {

                setDeletingId(

                    null

                );

            }

        };





    const toggleAreaFilter = (

        area

    ) => {

        setSelectedAreas(

            (previous) => {

                if (

                    previous.includes(

                        area

                    )

                ) {

                    return previous.filter(

                        (

                            selectedArea

                        ) =>

                            selectedArea !==

                            area

                    );

                }



                return [

                    ...previous,

                    area,

                ];

            }

        );

    };





    const clearFilters = () => {

        setSearchTerm("");



        setSelectedAreas([]);



        setAreaDropdownOpen(

            false

        );



        setCurrentPage(1);

    };





    const handleSort = (

        key

    ) => {

        setSortConfig(

            (previous) => {

                if (

                    previous.key ===

                    key

                ) {

                    return {

                        key,



                        direction:

                            previous.direction ===

                                "asc"

                                ? "desc"

                                : "asc",

                    };

                }



                return {

                    key,

                    direction:

                        "asc",

                };

            }

        );



        setCurrentPage(1);

    };





    const getSortIndicator = (

        key

    ) => {

        if (

            sortConfig.key !==

            key

        ) {

            return null;

        }



        return (

            <span className="sort-indicator">

                {sortConfig.direction ===

                    "asc"

                    ? "↑"

                    : "↓"}

            </span>

        );

    };





    const normalizedSearch =

        searchTerm

            .trim()

            .toLowerCase();





    /*

     * Filtering

     */

    const filteredContributors =

        contributors.filter(

            (contributor) => {

                const name =

                    contributor.name

                        ?.toLowerCase() ||

                    "";



                const address =

                    contributor.address

                        ?.toLowerCase() ||

                    "";



                const phone =

                    contributor.phone

                        ?.toLowerCase() ||

                    "";



                const area =

                    contributor.area

                        ?.toLowerCase() ||

                    "";



                const houseNumber =

                    contributor

                        .houseNumber

                        ?.toLowerCase() ||

                    "";



                const matchesSearch =

                    !normalizedSearch ||

                    name.includes(

                        normalizedSearch

                    ) ||

                    address.includes(

                        normalizedSearch

                    ) ||

                    phone.includes(

                        normalizedSearch

                    ) ||

                    area.includes(

                        normalizedSearch

                    ) ||

                    houseNumber.includes(

                        normalizedSearch

                    );



                const matchesArea =

                    selectedAreas.length ===

                    0 ||

                    selectedAreas.includes(

                        contributor.area

                    );



                return (

                    matchesSearch &&

                    matchesArea

                );

            }

        );





    /*

     * Sorting after filtering

     */

    const sortedContributors =

        [

            ...filteredContributors,

        ].sort(

            (

                firstContributor,

                secondContributor

            ) => {

                const firstValue =

                    String(

                        firstContributor[

                        sortConfig.key

                        ] ??

                        ""

                    );



                const secondValue =

                    String(

                        secondContributor[

                        sortConfig.key

                        ] ??

                        ""

                    );



                const comparison =

                    firstValue.localeCompare(

                        secondValue,

                        undefined,

                        {

                            numeric:

                                true,



                            sensitivity:

                                "base",

                        }

                    );



                return sortConfig.direction ===

                    "asc"

                    ? comparison

                    : -comparison;

            }

        );





    /*

     * Pagination after filtering

     * and sorting.

     */

    const totalPages =

        Math.max(

            1,

            Math.ceil(

                sortedContributors.length /

                pageSize

            )

        );





    const safeCurrentPage =

        Math.min(

            currentPage,

            totalPages

        );





    const startIndex =

        (safeCurrentPage - 1) *

        pageSize;





    const paginatedContributors =

        sortedContributors.slice(

            startIndex,

            startIndex +

            pageSize

        );





    const handlePageSizeChange =

        (newPageSize) => {

            setPageSize(

                newPageSize

            );



            setCurrentPage(1);

        };





    const filtersActive =

        searchTerm.trim() !==

        "" ||

        selectedAreas.length >

        0;





    return (

        <div className="page-container">



            <div className="page-header">

                <div>



                    <h1>

                        Contributors

                    </h1>



                    <p>

                        Add and manage contributor details

                    </p>



                </div>

            </div>





            <form

                onSubmit={

                    handleSubmit

                }

                className="form-card"

            >



                <h2>

                    {editingId !==

                        null

                        ? "Edit Contributor"

                        : "Add Contributor"}

                </h2>





                <div className="form-grid">



                    <div className="form-field">



                        <label>

                            Name

                        </label>



                        <input

                            name="name"

                            placeholder="Name"

                            value={

                                form.name

                            }

                            onChange={

                                handleChange

                            }

                            required

                        />



                    </div>





                    <div className="form-field">



                        <label>

                            House Number

                        </label>



                        <input

                            name="houseNumber"

                            placeholder="House number"

                            value={

                                form.houseNumber

                            }

                            onChange={

                                handleChange

                            }

                            required

                        />



                    </div>





                    <div className="form-field">



                        <label>

                            Area

                        </label>



                        <select
                            name="area"
                            value={form.area}
                            onChange={handleChange}
                            required
                            disabled={
                                loadingAreas ||
                                formAreaOptions.length === 0
                            }
                        >
                            {formAreaOptions.length === 0 && (
                                <option value="">
                                    No active areas available
                                </option>
                            )}

                            {formAreaOptions.map((area) => (
                                <option
                                    key={area.code}
                                    value={area.code}
                                >
                                    {area.name}
                                    {area.name !== area.code
                                        ? ` (${area.code})`
                                        : ""}
                                    {area.active === false
                                        ? " - Inactive"
                                        : ""}
                                </option>
                            ))}
                        </select>



                    </div>





                    <div className="form-field">



                        <label>

                            Phone

                        </label>



                        <input

                            name="phone"

                            placeholder="Phone"

                            value={

                                form.phone

                            }

                            onChange={

                                handleChange

                            }

                        />



                    </div>





                    <div className="form-field form-field-full">



                        <label>

                            Notes

                        </label>



                        <textarea

                            name="notes"

                            placeholder="Additional notes"

                            value={

                                form.notes

                            }

                            onChange={

                                handleChange

                            }

                        />



                    </div>



                </div>





                <div className="form-actions">



                    <button

                        type="submit"

                        className="primary-button"

                        disabled={
                            loading ||
                            loadingAreas ||
                            !form.area
                        }

                    >

                        {loading

                            ? "Saving..."

                            : editingId !==

                                null

                                ? "Update Contributor"

                                : "Add Contributor"}

                    </button>





                    {editingId !==

                        null && (

                            <button

                                type="button"

                                className="secondary-button"

                                onClick={

                                    handleCancelEdit

                                }

                                disabled={

                                    loading

                                }

                            >

                                Cancel

                            </button>

                        )}



                </div>



            </form>





            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}





            <div className="table-card">



                <h2>

                    Contributor List

                </h2>





                <div className="contributor-filter-toolbar">



                    <input

                        type="text"

                        className="search-input"

                        placeholder="Search by name, address, area, house number or phone"

                        value={

                            searchTerm

                        }

                        onChange={(

                            event

                        ) =>

                            setSearchTerm(

                                event

                                    .target

                                    .value

                            )

                        }

                    />





                    <div className="area-dropdown">



                        <button

                            type="button"

                            className="filter-dropdown-button"

                            onClick={() =>

                                setAreaDropdownOpen(

                                    (

                                        previous

                                    ) =>

                                        !previous

                                )

                            }

                        >

                            {selectedAreas.length ===

                                0

                                ? "All Areas"

                                : `${selectedAreas.length} Area${selectedAreas.length >

                                    1

                                    ? "s"

                                    : ""

                                } Selected`}

                        </button>





                        {areaDropdownOpen && (

                            <div className="area-dropdown-menu">



                                {filterAreas.map((area) => (
                                    <label
                                        key={area.code}
                                        className="area-dropdown-option"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAreas.includes(
                                                area.code
                                            )}
                                            onChange={() =>
                                                toggleAreaFilter(
                                                    area.code
                                                )
                                            }
                                        />

                                        <span>
                                            {area.name}
                                            {area.name !== area.code
                                                ? ` (${area.code})`
                                                : ""}
                                            {area.active === false
                                                ? " - Inactive"
                                                : ""}
                                        </span>
                                    </label>
                                ))}


                            </div>

                        )}



                    </div>





                    {filtersActive && (

                        <button

                            type="button"

                            className="secondary-button"

                            onClick={

                                clearFilters

                            }

                        >

                            Clear Filters

                        </button>

                    )}



                </div>





                {selectedAreas.length >

                    0 && (

                        <div className="selected-filter-summary">



                            <span>

                                Areas:

                            </span>



                            {selectedAreas.map(

                                (

                                    area

                                ) => (

                                    <span

                                        key={

                                            area

                                        }

                                        className="selected-filter-chip"

                                    >

                                        {getAreaDisplayName(area)}



                                        <button

                                            type="button"

                                            onClick={() =>

                                                toggleAreaFilter(

                                                    area

                                                )

                                            }

                                        >

                                            ×

                                        </button>

                                    </span>

                                )

                            )}



                        </div>

                    )}





                <div className="filtered-summary-card">



                    <span>

                        Contributors

                    </span>



                    <strong>

                        {

                            filteredContributors.length

                        }

                    </strong>



                    <span>

                        of{" "}

                        {

                            contributors.length

                        }{" "}

                        total

                    </span>



                </div>





                {contributors.length ===

                    0 ? (

                    <p>

                        No contributors available.

                    </p>



                ) : filteredContributors.length ===

                    0 ? (

                    <p>

                        No contributors match

                        the selected filters.

                    </p>



                ) : (

                    <>



                        <div className="table-wrapper">



                            <table>



                                <thead>

                                    <tr>



                                        <th

                                            className="sortable-header"

                                            onClick={() =>

                                                handleSort(

                                                    "name"

                                                )

                                            }

                                        >

                                            Name



                                            {getSortIndicator(

                                                "name"

                                            )}

                                        </th>





                                        <th

                                            className="sortable-header"

                                            onClick={() =>

                                                handleSort(

                                                    "address"

                                                )

                                            }

                                        >

                                            Address



                                            {getSortIndicator(

                                                "address"

                                            )}

                                        </th>





                                        <th

                                            className="sortable-header"

                                            onClick={() =>

                                                handleSort(

                                                    "phone"

                                                )

                                            }

                                        >

                                            Phone



                                            {getSortIndicator(

                                                "phone"

                                            )}

                                        </th>





                                        <th>

                                            Notes

                                        </th>





                                        <th>

                                            Actions

                                        </th>



                                    </tr>

                                </thead>





                                <tbody>



                                    {paginatedContributors.map(

                                        (

                                            contributor

                                        ) => (

                                            <tr

                                                key={

                                                    contributor.id

                                                }

                                            >



                                                <td>

                                                    {

                                                        contributor.name

                                                    }

                                                </td>





                                                <td>

                                                    {

                                                        contributor.address

                                                    }

                                                </td>





                                                <td>

                                                    {contributor.phone ||

                                                        "-"}

                                                </td>





                                                <td>

                                                    {contributor.notes ||

                                                        "-"}

                                                </td>





                                                <td>



                                                    <div className="table-actions">



                                                        <button

                                                            type="button"

                                                            className="secondary-button"

                                                            onClick={() =>

                                                                handleEdit(

                                                                    contributor

                                                                )

                                                            }

                                                        >

                                                            Edit

                                                        </button>





                                                        <button

                                                            type="button"

                                                            className="danger-button"

                                                            onClick={() =>

                                                                handleDelete(

                                                                    contributor.id

                                                                )

                                                            }

                                                            disabled={

                                                                deletingId ===

                                                                contributor.id

                                                            }

                                                        >

                                                            {deletingId ===

                                                                contributor.id

                                                                ? "Deleting..."

                                                                : "Delete"}

                                                        </button>



                                                    </div>



                                                </td>



                                            </tr>

                                        )

                                    )}



                                </tbody>



                            </table>



                        </div>





                        <Pagination

                            currentPage={

                                safeCurrentPage

                            }

                            totalItems={

                                sortedContributors.length

                            }

                            pageSize={

                                pageSize

                            }

                            onPageChange={

                                setCurrentPage

                            }

                            onPageSizeChange={

                                handlePageSizeChange

                            }

                        />



                    </>

                )}



            </div>



        </div>

    );

};





export default Contributors;