
let isDragging = false; //记录便笺的拖动事件
let dragX, dragY;//便笺拖动的位置偏移
let noteIndex = null;//记录当前被选中高亮标记的便笺

// 用于设置背景图片
function setBackground() {
    const input = document.getElementById('background-input');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            saveData();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 添加便笺到页面上
function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const note = createNoteElement(taskText);
    const notesContainer = document.getElementById('notes-container');
    notesContainer.appendChild(note);

    taskInput.value = '';
    updateSidebar(); // 更新侧边栏
    saveData();
}

// 创建便笺相关元素，加入了一些相关的事件处理函数
function createNoteElement(taskText) {
    const note = document.createElement('div');
    note.className = 'note';
    note.style.position = 'absolute';
    note.style.left = Math.random() * 200 + 'px';
    note.style.top = Math.random() * 200 + 'px';
    note.draggable = false;

    const title = document.createElement('h3');
    title.contentEditable = true;
    title.textContent = 'To-Do';
    note.appendChild(title);

    const content = document.createElement('div');
    content.className = 'note-content';

    const ul = document.createElement('ul');
    const li = document.createElement('li');
    li.textContent = '·' + taskText;
    ul.appendChild(li);
    note.appendChild(ul);
    note.appendChild(content);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'add-task-btn';
    addTaskBtn.textContent = '添加事项';
    addTaskBtn.onclick = function () {
        const newTask = prompt('请输入新事项：');
        if (newTask) {
            const newLi = document.createElement('li');
            newLi.textContent = '·';
            newLi.textContent = newLi.textContent + newTask;
            ul.appendChild(newLi);
            saveData(); 
        }
    };
    buttonContainer.appendChild(addTaskBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = function () {
        note.remove();
        updateSidebar();
        saveData(); 
    };
    note.appendChild(deleteBtn);


    const textColorBtn = document.createElement('button');
    textColorBtn.className = 'text-color-btn';
    textColorBtn.textContent = '文字颜色';
    textColorBtn.onclick = function () {
        showTextColorPicker(note);
    };
    buttonContainer.appendChild(textColorBtn);

    const backgroundColorBtn = document.createElement('button');
    backgroundColorBtn.className = 'background-color-btn';
    backgroundColorBtn.textContent = '便笺颜色';
    backgroundColorBtn.onclick = function () {
        backgroundColorPicker(note);
    };
    buttonContainer.appendChild(backgroundColorBtn);

    const addImageBtn = document.createElement('button');
    addImageBtn.className = 'add-image-btn';
    addImageBtn.textContent = '插入图片';
    addImageBtn.onclick = function () {
        insertImage(note);
    };
    buttonContainer.appendChild(addImageBtn);

    note.appendChild(buttonContainer);

    note.onmousedown = function (e) {
        //事件对象e用于获取鼠标信息
        dragStart(e, note);
    };


    note.addEventListener('input', saveData); // 内容变动时保存数据
    note.addEventListener('click', saveData); // 颜色变动或任务标记时保存数据
    return note;
}

//便笺颜色函数
function backgroundColorPicker(note) {
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.addEventListener('input', function() {
        note.style.backgroundColor = colorPicker.value;
    });
    colorPicker.click(); 
}

//标题颜色函数
function titleColorBtn(){
    const titleColorPicker = document.createElement('input');
    titleColorPicker.type = 'color';
    titleColorPicker.addEventListener('input',function() {
        let titleBar = document.querySelector('.title-bar');
        titleBar.style.backgroundColor = titleColorPicker.value;
    });
    titleColorPicker.click();
}

// 文本颜色函数
function showTextColorPicker(note) {
    const textColorPicker = document.createElement('input');
    textColorPicker.type = 'color';
    textColorPicker.addEventListener('input', function() {
        note.style.color = textColorPicker.value;
    });
    textColorPicker.click(); 
}

// 插入图片函数
function insertImage(note) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = function () {
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                imgContainer.style.display = 'inline-block';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.display = 'block';
                img.style.margin = '10px 0';
                
                //加了个删除按钮
                const deleteImgBtn = document.createElement('button');
                deleteImgBtn.textContent = '×';
                deleteImgBtn.style.position = 'absolute';
                deleteImgBtn.style.top = '5px';
                deleteImgBtn.style.right = '5px';
                deleteImgBtn.style.color = 'white';
                deleteImgBtn.style.border = 'none';
                deleteImgBtn.style.background = 'none';
                deleteImgBtn.onclick = function () {
                    imgContainer.remove();
                    saveData();
                };

                imgContainer.appendChild(img);
                imgContainer.appendChild(deleteImgBtn);
                const content = note.querySelector('.note-content');
                content.appendChild(imgContainer);
                saveData();
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    };
    fileInput.click();
}

// 调整便笺大小函数*有点问题
/*function adjustNoteSize(note) {
    const padding = 20;
    const boundingRect = note.getBoundingClientRect();
    note.style.width = 'auto';
    note.style.height = 'auto';
    note.style.width = boundingRect.width + padding + 'px';
    note.style.height = boundingRect.height + padding + 'px';
    note.querySelector('ul').style.maxHeight = 'calc(100% - 40px)';
}*/

// 拖动开始函数
function dragStart(e, note) {
    isDragging = true;
    const boundingRect = note.getBoundingClientRect();
    dragX = e.clientX - boundingRect.left;
    dragY = e.clientY - boundingRect.top;

    // 在document上绑定move和up事件，让拖动和释放都能被监听到
    document.onmousemove = function(e) {
        dragMove(e, note);
    };
    document.onmouseup = function(e) {
        dragEnd(e, note);
    };
}
// 拖动过程函数
function dragMove(e, note) {
    if (!isDragging) return;
    e.preventDefault();//防止被默认的鼠标事件打断
    note.style.left = (e.clientX - dragX) + 'px';
    note.style.top = (e.clientY - dragY) + 'px';
}
// 拖动结束函数
function dragEnd(e, note) {
    isDragging = false;
    document.onmousemove = null; 
    document.onmouseup = null; // 解除事件绑定
}

// 标记便笺中的任务为已完成状态
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
        e.target.classList.toggle('completed');
    }
});

// 更新侧边栏
function updateSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = ''; // 清空侧边栏内容

    const notes = document.querySelectorAll('.note');
    notes.forEach((note, index) => {
        const title = note.querySelector('h3').textContent;
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.textContent = title;
        
        const deleteItemBtn = document.createElement('button');
        deleteItemBtn.textContent = 'Delete';
        deleteItemBtn.onclick = function () {
            note.remove();
            updateSidebar(); // 更新侧边栏
        };

        item.onclick = function () {
            highlightNote(index);
        };

        item.appendChild(deleteItemBtn);
        sidebar.appendChild(item);
    });
}

// 高亮选中的便笺
function highlightNote(index) {
    const notes = document.querySelectorAll('.note');
    notes.forEach((note, i) => {
        if (i === index) {
            note.style.border = '2px solid blue'; // 高亮边框
            noteIndex = index;
        } else {
            note.style.border = '1px solid #e6e6e6'; // 取消高亮
        }
    });
}

// 全局点击事件处理，用于取消高亮
document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('sidebar-item') && !e.target.closest('.note')) {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            note.style.border = '1px solid #e6e6e6'; // 取消所有便笺的高亮
        });
        noteIndex = null;
    }
});


// 用于保存便笺和背景设置到LocalStorage
function saveData() {
    const notes = [];
    document.querySelectorAll('.note').forEach(note => {
        const tasks = Array.from(note.querySelectorAll('ul li')).map(li => ({
            text: li.textContent,
            completed: li.classList.contains('completed')
        }));/* 任务是否完成的对应关系 */
        notes.push({
            left: note.style.left,
            top: note.style.top,
            backgroundColor: note.style.backgroundColor,
            color: note.style.color,
            title: note.querySelector('h3').textContent,
            content: tasks,
            images: Array.from(note.querySelectorAll('.note-content img')).map(img => img.src)
        });
    });

    const titleBar = document.querySelector('.title-bar');
    const titleBarColor = titleBar.style.backgroundColor;

    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('background', document.body.style.backgroundImage);
    localStorage.setItem('titleBarColor', titleBarColor); 
}


// 用于从LocalStorage加载数据
function loadData() {
    const notes = JSON.parse(localStorage.getItem('notes'));
    const background = localStorage.getItem('background');
    const titleBarColor = localStorage.getItem('titleBarColor'); 

    if (background) {
        document.body.style.backgroundImage = background;
    }

    if (titleBarColor) {
        const titleBar = document.querySelector('.title-bar');
        titleBar.style.backgroundColor = titleBarColor;
    }

    if (notes) {
        const notesContainer = document.getElementById('notes-container');
        notesContainer.innerHTML = ''; //清空容器中的便笺
        
        notes.forEach(noteData => {
            const note = createNoteElement('');
            note.style.left = noteData.left;
            note.style.top = noteData.top;
            note.style.backgroundColor = noteData.backgroundColor;
            note.style.color = noteData.color;
            note.querySelector('h3').textContent = noteData.title;

            const ul = note.querySelector('ul');
            ul.innerHTML = ''; // 清空内容
            noteData.content.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.text;
                if (task.completed) {
                    li.classList.add('completed');
                }
                ul.appendChild(li);
            });//检测完成状况

            const content = note.querySelector('.note-content');
            noteData.images.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.style.maxWidth = '100%';
                img.style.display = 'block';
                img.style.margin = '10px 0';
                content.appendChild(img);
            });

            notesContainer.appendChild(note);
        });
        updateSidebar();
    }
}



// 页面加载完成后加载数据
document.addEventListener('DOMContentLoaded', function() {
    loadData();

    //初始化侧边栏
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    sidebarToggleBtn.onclick = function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
    };
    updateSidebar();
});

// 在页面关闭前保存数据
window.addEventListener('beforeunload', function() {
    saveData();
});