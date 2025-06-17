class AdvancedTodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || []
    this.currentFilter = "all"
    this.currentSort = "newest"
    this.currentCategory = "all"
    this.editingTaskId = null
    this.selectedTasks = new Set()
    this.searchQuery = ""

    this.initializeElements()
    this.bindEvents()
    this.renderTasks()
    this.updateStats()
    this.updateCategoryCounts()
    this.initializeTheme()
    this.setTodayAsMinDate()
  }

  initializeElements() {
    // Form elements
    this.addTaskForm = document.getElementById("addTaskForm")
    this.taskInput = document.getElementById("taskInput")
    this.categorySelect = document.getElementById("categorySelect")
    this.prioritySelect = document.getElementById("prioritySelect")
    this.dueDateInput = document.getElementById("dueDateInput")
    this.taskNotes = document.getElementById("taskNotes")
    this.toggleOptionsBtn = document.getElementById("toggleOptions")
    this.formOptions = document.getElementById("formOptions")

    // Search
    this.searchInput = document.getElementById("searchInput")
    this.clearSearchBtn = document.getElementById("clearSearch")

    // Filter elements
    this.filterBtns = document.querySelectorAll(".filter-btn")
    this.categoryBtns = document.querySelectorAll(".category-btn")
    this.sortSelect = document.getElementById("sortSelect")
    this.currentViewSpan = document.getElementById("currentView")

    // Bulk actions
    this.selectAllBtn = document.getElementById("selectAll")
    this.bulkCompleteBtn = document.getElementById("bulkComplete")
    this.bulkDeleteBtn = document.getElementById("bulkDelete")
    this.clearCompletedBtn = document.getElementById("clearCompleted")

    // Display elements
    this.tasksContainer = document.getElementById("tasksContainer")
    this.emptyState = document.getElementById("emptyState")
    this.totalTasksSpan = document.getElementById("totalTasks")
    this.completedTasksSpan = document.getElementById("completedTasks")
    this.pendingTasksSpan = document.getElementById("pendingTasks")
    this.overdueTasksSpan = document.getElementById("overdueTasks")

    // Modal elements
    this.editModal = document.getElementById("editModal")
    this.editForm = document.getElementById("editForm")
    this.editTaskInput = document.getElementById("editTaskInput")
    this.editCategorySelect = document.getElementById("editCategorySelect")
    this.editPrioritySelect = document.getElementById("editPrioritySelect")
    this.editDueDateInput = document.getElementById("editDueDateInput")
    this.editTaskNotes = document.getElementById("editTaskNotes")
    this.closeModalBtn = document.getElementById("closeModal")
    this.cancelEditBtn = document.getElementById("cancelEdit")

    // Details modal
    this.detailsModal = document.getElementById("detailsModal")
    this.taskDetailsContent = document.getElementById("taskDetailsContent")
    this.closeDetailsModalBtn = document.getElementById("closeDetailsModal")

    // Theme toggle
    this.themeToggle = document.getElementById("themeToggle")

    // Import/Export
    this.exportBtn = document.getElementById("exportTasks")
    this.importBtn = document.getElementById("importTasks")
    this.importFile = document.getElementById("importFile")

    // Notification container
    this.notificationContainer = document.getElementById("notificationContainer")
  }

  bindEvents() {
    // Add task form
    this.addTaskForm.addEventListener("submit", (e) => this.handleAddTask(e))
    this.toggleOptionsBtn.addEventListener("click", () => this.toggleFormOptions())

    // Search
    this.searchInput.addEventListener("input", (e) => this.handleSearch(e))
    this.clearSearchBtn.addEventListener("click", () => this.clearSearch())

    // Filter buttons
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilterChange(e))
    })

    // Category buttons
    this.categoryBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleCategoryChange(e))
    })

    // Sort select
    this.sortSelect.addEventListener("change", (e) => this.handleSortChange(e))

    // Bulk actions
    this.selectAllBtn.addEventListener("click", () => this.toggleSelectAll())
    this.bulkCompleteBtn.addEventListener("click", () => this.bulkComplete())
    this.bulkDeleteBtn.addEventListener("click", () => this.bulkDelete())
    this.clearCompletedBtn.addEventListener("click", () => this.clearCompleted())

    // Edit modal
    this.editForm.addEventListener("submit", (e) => this.handleEditTask(e))
    this.closeModalBtn.addEventListener("click", () => this.closeEditModal())
    this.cancelEditBtn.addEventListener("click", () => this.closeEditModal())
    this.editModal.addEventListener("click", (e) => {
      if (e.target === this.editModal) this.closeEditModal()
    })

    // Details modal
    this.closeDetailsModalBtn.addEventListener("click", () => this.closeDetailsModal())
    this.detailsModal.addEventListener("click", (e) => {
      if (e.target === this.detailsModal) this.closeDetailsModal()
    })

    // Theme toggle
    this.themeToggle.addEventListener("click", () => this.toggleTheme())

    // Import/Export
    this.exportBtn.addEventListener("click", () => this.exportTasks())
    this.importBtn.addEventListener("click", () => this.importFile.click())
    this.importFile.addEventListener("change", (e) => this.importTasks(e))

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyboardShortcuts(e))
  }

  setTodayAsMinDate() {
    const today = new Date().toISOString().split("T")[0]
    this.dueDateInput.min = today
    this.editDueDateInput.min = today
  }

  toggleFormOptions() {
    this.formOptions.classList.toggle("active")
    const icon = this.toggleOptionsBtn.querySelector("i")
    if (this.formOptions.classList.contains("active")) {
      icon.className = "fas fa-chevron-up"
    } else {
      icon.className = "fas fa-cog"
    }
  }

  handleSearch(e) {
    this.searchQuery = e.target.value.toLowerCase().trim()
    this.renderTasks()

    if (this.searchQuery) {
      this.clearSearchBtn.style.display = "block"
    } else {
      this.clearSearchBtn.style.display = "none"
    }
  }

  clearSearch() {
    this.searchInput.value = ""
    this.searchQuery = ""
    this.clearSearchBtn.style.display = "none"
    this.renderTasks()
  }

  handleAddTask(e) {
    e.preventDefault()

    const text = this.taskInput.value.trim()
    if (!text) return

    const task = {
      id: Date.now().toString(),
      text: text,
      notes: this.taskNotes.value.trim() || null,
      completed: false,
      category: this.categorySelect.value,
      priority: this.prioritySelect.value,
      dueDate: this.dueDateInput.value || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.tasks.unshift(task)
    this.saveTasks()
    this.renderTasks()
    this.updateStats()
    this.updateCategoryCounts()

    // Reset form
    this.addTaskForm.reset()
    this.formOptions.classList.remove("active")
    this.toggleOptionsBtn.querySelector("i").className = "fas fa-cog"
    this.taskInput.focus()

    this.showNotification("Task added successfully!", "success")
  }

  handleFilterChange(e) {
    this.filterBtns.forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")
    this.currentFilter = e.target.dataset.filter
    this.updateCurrentView()
    this.renderTasks()
  }

  handleCategoryChange(e) {
    this.categoryBtns.forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")
    this.currentCategory = e.target.dataset.category
    this.updateCurrentView()
    this.renderTasks()
  }

  handleSortChange(e) {
    this.currentSort = e.target.value
    this.renderTasks()
  }

  updateCurrentView() {
    let view = ""

    if (this.currentCategory !== "all") {
      view = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1)
    } else {
      view = "All"
    }

    if (this.currentFilter !== "all") {
      view += ` - ${this.currentFilter.charAt(0).toUpperCase() + this.currentFilter.slice(1)}`
    }

    view += " Tasks"
    this.currentViewSpan.textContent = view
  }

  toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      task.completedAt = task.completed ? new Date().toISOString() : null
      task.updatedAt = new Date().toISOString()
      this.saveTasks()
      this.renderTasks()
      this.updateStats()
      this.updateCategoryCounts()

      const message = task.completed ? "Task completed!" : "Task marked as pending"
      this.showNotification(message, task.completed ? "success" : "info")
    }
  }

  deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((t) => t.id !== taskId)
      this.selectedTasks.delete(taskId)
      this.saveTasks()
      this.renderTasks()
      this.updateStats()
      this.updateCategoryCounts()
      this.updateBulkActions()
      this.showNotification("Task deleted successfully!", "success")
    }
  }

  editTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      this.editingTaskId = taskId
      this.editTaskInput.value = task.text
      this.editCategorySelect.value = task.category
      this.editPrioritySelect.value = task.priority
      this.editDueDateInput.value = task.dueDate || ""
      this.editTaskNotes.value = task.notes || ""
      this.openEditModal()
    }
  }

  viewTaskDetails(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      this.renderTaskDetails(task)
      this.openDetailsModal()
    }
  }

  renderTaskDetails(task) {
    const createdDate = new Date(task.createdAt).toLocaleString()
    const updatedDate = task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "Never"
    const completedDate = task.completedAt ? new Date(task.completedAt).toLocaleString() : "Not completed"
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"

    this.taskDetailsContent.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Task:</span>
                <span class="detail-value">${this.escapeHtml(task.text)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${task.completed ? "Completed" : "Pending"}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Priority:</span>
                <span class="detail-value">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value">${dueDate}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Created:</span>
                <span class="detail-value">${createdDate}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Last Updated:</span>
                <span class="detail-value">${updatedDate}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Completed:</span>
                <span class="detail-value">${completedDate}</span>
            </div>
            ${
              task.notes
                ? `
                <div class="detail-item">
                    <span class="detail-label">Notes:</span>
                    <span class="detail-value">${this.escapeHtml(task.notes)}</span>
                </div>
            `
                : ""
            }
        `
  }

  handleEditTask(e) {
    e.preventDefault()

    const task = this.tasks.find((t) => t.id === this.editingTaskId)
    if (task) {
      task.text = this.editTaskInput.value.trim()
      task.category = this.editCategorySelect.value
      task.priority = this.editPrioritySelect.value
      task.dueDate = this.editDueDateInput.value || null
      task.notes = this.editTaskNotes.value.trim() || null
      task.updatedAt = new Date().toISOString()

      this.saveTasks()
      this.renderTasks()
      this.updateCategoryCounts()
      this.closeEditModal()
      this.showNotification("Task updated successfully!", "success")
    }
  }

  openEditModal() {
    this.editModal.classList.add("active")
    this.editTaskInput.focus()
  }

  closeEditModal() {
    this.editModal.classList.remove("active")
    this.editingTaskId = null
  }

  openDetailsModal() {
    this.detailsModal.classList.add("active")
  }

  closeDetailsModal() {
    this.detailsModal.classList.remove("active")
  }

  toggleSelectAll() {
    const filteredTasks = this.getFilteredTasks()
    const allSelected = filteredTasks.every((task) => this.selectedTasks.has(task.id))

    if (allSelected) {
      filteredTasks.forEach((task) => this.selectedTasks.delete(task.id))
    } else {
      filteredTasks.forEach((task) => this.selectedTasks.add(task.id))
    }

    this.renderTasks()
    this.updateBulkActions()
  }

  toggleTaskSelection(taskId) {
    if (this.selectedTasks.has(taskId)) {
      this.selectedTasks.delete(taskId)
    } else {
      this.selectedTasks.add(taskId)
    }
    this.updateBulkActions()
  }

  updateBulkActions() {
    const selectedCount = this.selectedTasks.size
    this.bulkCompleteBtn.disabled = selectedCount === 0
    this.bulkDeleteBtn.disabled = selectedCount === 0

    this.selectAllBtn.textContent = selectedCount > 0 ? `Deselect All (${selectedCount})` : "Select All"
  }

  bulkComplete() {
    const selectedTaskIds = Array.from(this.selectedTasks)
    let completedCount = 0

    selectedTaskIds.forEach((taskId) => {
      const task = this.tasks.find((t) => t.id === taskId)
      if (task && !task.completed) {
        task.completed = true
        task.completedAt = new Date().toISOString()
        task.updatedAt = new Date().toISOString()
        completedCount++
      }
    })

    this.selectedTasks.clear()
    this.saveTasks()
    this.renderTasks()
    this.updateStats()
    this.updateCategoryCounts()
    this.updateBulkActions()

    this.showNotification(`${completedCount} task(s) marked as completed!`, "success")
  }

  bulkDelete() {
    const selectedCount = this.selectedTasks.size
    if (confirm(`Are you sure you want to delete ${selectedCount} selected task(s)?`)) {
      this.tasks = this.tasks.filter((task) => !this.selectedTasks.has(task.id))
      this.selectedTasks.clear()
      this.saveTasks()
      this.renderTasks()
      this.updateStats()
      this.updateCategoryCounts()
      this.updateBulkActions()

      this.showNotification(`${selectedCount} task(s) deleted successfully!`, "success")
    }
  }

  clearCompleted() {
    const completedTasks = this.tasks.filter((t) => t.completed)
    if (completedTasks.length === 0) {
      this.showNotification("No completed tasks to clear", "info")
      return
    }

    if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
      this.tasks = this.tasks.filter((t) => !t.completed)
      this.selectedTasks.clear()
      this.saveTasks()
      this.renderTasks()
      this.updateStats()
      this.updateCategoryCounts()
      this.updateBulkActions()

      this.showNotification(`${completedTasks.length} completed task(s) deleted!`, "success")
    }
  }

  getFilteredTasks() {
    let filtered = [...this.tasks]

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.text.toLowerCase().includes(this.searchQuery) ||
          (task.notes && task.notes.toLowerCase().includes(this.searchQuery)) ||
          task.category.toLowerCase().includes(this.searchQuery),
      )
    }

    // Apply category filter
    if (this.currentCategory !== "all") {
      filtered = filtered.filter((t) => t.category === this.currentCategory)
    }

    // Apply status filter
    const today = new Date().toISOString().split("T")[0]
    switch (this.currentFilter) {
      case "pending":
        filtered = filtered.filter((t) => !t.completed)
        break
      case "completed":
        filtered = filtered.filter((t) => t.completed)
        break
      case "overdue":
        filtered = filtered.filter((t) => !t.completed && t.dueDate && t.dueDate < today)
        break
    }

    // Apply sort
    switch (this.currentSort) {
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        filtered.sort((a, b) => {
          if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          }
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        break
      case "dueDate":
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return new Date(b.createdAt) - new Date(a.createdAt)
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        })
        break
      case "category":
        filtered.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        break
      case "alphabetical":
        filtered.sort((a, b) => a.text.localeCompare(b.text))
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return filtered
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks()

    if (filteredTasks.length === 0) {
      this.tasksContainer.style.display = "none"
      this.emptyState.style.display = "block"
      return
    }

    this.tasksContainer.style.display = "block"
    this.emptyState.style.display = "none"

    this.tasksContainer.innerHTML = filteredTasks.map((task) => this.createTaskHTML(task)).join("")

    // Bind task events
    this.bindTaskEvents()
  }

  createTaskHTML(task) {
    const today = new Date().toISOString().split("T")[0]
    const isOverdue = task.dueDate && task.dueDate < today && !task.completed
    const isToday = task.dueDate === today
    const dueDateFormatted = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null
    const isSelected = this.selectedTasks.has(task.id)

    let dueDateClass = ""
    if (isOverdue) dueDateClass = "overdue"
    else if (isToday) dueDateClass = "today"

    return `
            <div class="task-item ${task.completed ? "completed" : ""} ${isSelected ? "selected" : ""}" data-task-id="${task.id}">
                <div class="task-header">
                    <input type="checkbox" class="task-select" ${isSelected ? "checked" : ""} data-task-id="${task.id}">
                    <div class="task-checkbox ${task.completed ? "checked" : ""}" data-task-id="${task.id}"></div>
                    <div class="task-content">
                        <div class="task-text" data-task-id="${task.id}">${this.escapeHtml(task.text)}</div>
                        ${task.notes ? `<div class="task-notes">${this.escapeHtml(task.notes)}</div>` : ""}
                        <div class="task-meta">
                            <span class="task-category ${task.category}">${this.getCategoryIcon(task.category)} ${task.category}</span>
                            <span class="task-priority ${task.priority}">${this.getPriorityIcon(task.priority)} ${task.priority}</span>
                            ${
                              dueDateFormatted
                                ? `<span class="task-due-date ${dueDateClass}">
                                <i class="fas fa-calendar"></i> ${dueDateFormatted}
                                ${isOverdue ? '<i class="fas fa-exclamation-triangle"></i>' : ""}
                                ${isToday ? '<i class="fas fa-clock"></i>' : ""}
                            </span>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn view-btn" data-task-id="${task.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="task-btn edit-btn" data-task-id="${task.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="task-btn delete-btn" data-task-id="${task.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `
  }

  getCategoryIcon(category) {
    const icons = {
      personal: '<i class="fas fa-user"></i>',
      work: '<i class="fas fa-briefcase"></i>',
      shopping: '<i class="fas fa-shopping-cart"></i>',
      health: '<i class="fas fa-heart"></i>',
      education: '<i class="fas fa-graduation-cap"></i>',
    }
    return icons[category] || '<i class="fas fa-tag"></i>'
  }

  getPriorityIcon(priority) {
    const icons = {
      high: '<i class="fas fa-exclamation-circle"></i>',
      medium: '<i class="fas fa-minus-circle"></i>',
      low: '<i class="fas fa-circle"></i>',
    }
    return icons[priority] || '<i class="fas fa-circle"></i>'
  }

  bindTaskEvents() {
    // Task selection checkboxes
    document.querySelectorAll(".task-select").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.toggleTaskSelection(e.target.dataset.taskId)
        this.renderTasks()
      })
    })

    // Task completion checkboxes
    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("click", (e) => {
        this.toggleTask(e.target.dataset.taskId)
      })
    })

    // Task text click for details
    document.querySelectorAll(".task-text").forEach((text) => {
      text.addEventListener("click", (e) => {
        this.viewTaskDetails(e.target.dataset.taskId)
      })
    })

    // View button events
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.viewTaskDetails(e.target.closest(".task-btn").dataset.taskId)
      })
    })

    // Edit button events
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.editTask(e.target.closest(".task-btn").dataset.taskId)
      })
    })

    // Delete button events
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.deleteTask(e.target.closest(".task-btn").dataset.taskId)
      })
    })
  }

  updateStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter((t) => t.completed).length
    const pending = total - completed
    const today = new Date().toISOString().split("T")[0]
    const overdue = this.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length

    this.totalTasksSpan.textContent = total
    this.completedTasksSpan.textContent = completed
    this.pendingTasksSpan.textContent = pending
    this.overdueTasksSpan.textContent = overdue
  }

  updateCategoryCounts() {
    const categories = ["all", "personal", "work", "shopping", "health", "education"]

    categories.forEach((category) => {
      const count = category === "all" ? this.tasks.length : this.tasks.filter((t) => t.category === category).length

      const countElement = document.getElementById(`${category}Count`)
      if (countElement) {
        countElement.textContent = count
      }
    })
  }

  exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `tasks-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    this.showNotification("Tasks exported successfully!", "success")
  }

  importTasks(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result)

        if (!Array.isArray(importedTasks)) {
          throw new Error("Invalid file format")
        }

        // Validate task structure
        const validTasks = importedTasks.filter((task) => task.id && task.text && task.category && task.priority)

        if (validTasks.length === 0) {
          throw new Error("No valid tasks found in file")
        }

        // Merge with existing tasks (avoid duplicates)
        const existingIds = new Set(this.tasks.map((t) => t.id))
        const newTasks = validTasks.filter((task) => !existingIds.has(task.id))

        this.tasks = [...this.tasks, ...newTasks]
        this.saveTasks()
        this.renderTasks()
        this.updateStats()
        this.updateCategoryCounts()

        this.showNotification(`${newTasks.length} task(s) imported successfully!`, "success")
      } catch (error) {
        this.showNotification("Error importing tasks: " + error.message, "error")
      }
    }

    reader.readAsText(file)
    e.target.value = "" // Reset file input
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks))
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)

    // Update theme toggle icon
    const icon = this.themeToggle.querySelector("i")
    icon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)

    const icon = this.themeToggle.querySelector("i")
    icon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }

  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (document.activeElement === this.taskInput) {
        this.addTaskForm.dispatchEvent(new Event("submit"))
      }
    }

    // Escape to close modals
    if (e.key === "Escape") {
      this.closeEditModal()
      this.closeDetailsModal()
    }

    // Ctrl/Cmd + / to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault()
      this.searchInput.focus()
    }

    // Ctrl/Cmd + A to select all tasks
    if ((e.ctrlKey || e.metaKey) && e.key === "a" && !e.target.matches("input, textarea")) {
      e.preventDefault()
      this.toggleSelectAll()
    }

    // Delete key to delete selected tasks
    if (e.key === "Delete" && this.selectedTasks.size > 0 && !e.target.matches("input, textarea")) {
      e.preventDefault()
      this.bulkDelete()
    }
  }

  showNotification(message, type = "info", title = "") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`

    const iconMap = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    notification.innerHTML = `
            <div class="notification-icon">
                <i class="${iconMap[type]}"></i>
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ""}
                <div class="notification-message">${message}</div>
            </div>
        `

    this.notificationContainer.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        if (notification.parentNode) {
          this.notificationContainer.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AdvancedTodoApp()
})