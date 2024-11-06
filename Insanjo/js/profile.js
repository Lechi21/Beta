
// TOGGLE ICON
function toggleEditMode(fieldId) {
    const field = document.getElementById(fieldId);
    const editIcon = field.querySelector('.edit-icon');
    const saveIcon = field.querySelector('.save-icon');
    const input = field.querySelector('.field-input');

    if (field.classList.contains('edit-mode')) {
        saveEdit(fieldId);
    } else {
        field.classList.add('edit-mode');
        editIcon.style.display = 'none';
        saveIcon.style.display = 'inline-block';
        input.removeAttribute('disabled');
        input.focus();
    }
}

function saveEdit(fieldId) {
    const field = document.getElementById(fieldId);
    const editIcon = field.querySelector('.edit-icon');
    const saveIcon = field.querySelector('.save-icon');
    const input = field.querySelector('.field-input');

    field.classList.remove('edit-mode');
    editIcon.style.display = 'inline-block';
    saveIcon.style.display = 'none';
    input.setAttribute('disabled', 'disabled');
}
// JAVASCRIPT FOR PROFILE PHOTO
function updateImage() {
    var input = document.getElementById('uploadInput');
    var profileImage = document.querySelector('.profile_image');

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            profileImage.style.backgroundImage = 'url(' + e.target.result + ')';
        };

        reader.readAsDataURL(input.files[0]);
    }
}
